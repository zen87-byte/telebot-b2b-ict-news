const Parser = require("rss-parser");
const axios = require("axios");
const parser = new Parser();

async function resolveGoogleNewsLink(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: (status) => status === 301 || status === 302,
    });
    return response.headers.location || url;
  } catch {
    return url;
  }
}

async function fetchAllNews(RSS_FEEDS, MAX_ITEMS_PER_FEED) {
  let allNews = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      const simplifiedItems = await Promise.all(
        items.map(async (item) => {
          let realLink = item.link;

          if (realLink.includes("news.google.com/rss/articles")) {
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
        `[fetchNews] Gagal ambil feed dari ${feedUrl}:`,
        error.message
      );
    }
  }

  return allNews;
}

module.exports = fetchAllNews;
