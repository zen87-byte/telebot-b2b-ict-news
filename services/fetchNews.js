const Parser = require("rss-parser");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const parser = new Parser();

const RSS_FEEDS = process.env.RSS_FEEDS
  ? process.env.RSS_FEEDS.split(",")
      .map((f) => f.trim())
      .filter(Boolean)
  : [];

const MAX_ITEMS_PER_FEED = parseInt(process.env.MAX_ITEMS_PER_FEED || "1", 10);

async function resolveGoogleNewsLink(url) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // setelah JS jalan, URL berubah ke artikel asli
    const finalUrl = page.url();
    return finalUrl;
  } catch (err) {
    console.error("[resolveGoogleNewsLink] Gagal resolve:", url, err.message);
    return url;
  } finally {
    if (browser) {
      await browser.close();
    }
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
