const Parser = require('rss-parser');
const parser = new Parser();
const { RSS_FEEDS, MAX_ITEMS_PER_FEED } = require('../config');

async function fetchAllNews() {
  let allNews = [];

  for (const url of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items.slice(0, MAX_ITEMS_PER_FEED);

      const simplifiedItems = items.map(item => ({
        title: item.title,
        link: item.link
      }));

      allNews.push(...simplifiedItems);
    } catch (error) {
      console.error(`[fetchNews] Gagal ambil feed dari ${url}:`, error.message);
    }
  }

  return allNews;
}

module.exports = fetchAllNews;
