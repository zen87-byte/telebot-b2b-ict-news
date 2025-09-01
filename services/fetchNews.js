const Parser = require("rss-parser");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

const parser = new Parser();

const RSS_FEEDS = process.env.RSS_FEEDS
  ? process.env.RSS_FEEDS.split(",")
      .map((f) => f.trim())
      .filter(Boolean)
  : [];

const MAX_ITEMS_PER_FEED = parseInt(process.env.MAX_ITEMS_PER_FEED || "1", 10);

async function resolveGoogleNewsLink(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    const finalUrl = await page.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) return canonical.href;
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) return ogUrl.content;
      return window.location.href;
    });
    await browser.close();
    return finalUrl;

  } catch (err) {
    console.error("[resolveGoogleNewsLink] Gagal resolve:", url, err.message);
    if (browser) await browser.close();
    return url;
  }
}

async function fetchAllNews() {
  let allNews = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      const simplifiedItems = await Promise.all(
        items.map(async (item) => {
          let realLink = item.link;

          if (realLink.includes("https://news.google.com")) {
            realLink = await resolveGoogleNewsLink(realLink);
          }

          return {
            title: item.title,
            link: realLink,
            description:
              item.contentSnippet ||
              item.summary ||
              item.description ||
              item.content ||
              "No description",
          };
        })
      );

      allNews.push(...simplifiedItems);
    } catch (error) {
      console.error(
        `[fetchAllNews] Gagal ambil feed dari ${feedUrl}:`,
        error.message
      );
    }
  }

  return allNews;
}

module.exports = fetchAllNews;
