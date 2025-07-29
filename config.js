require('dotenv').config();

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  RSS_FEEDS: process.env.RSS_FEEDS.split(',').map(url => url.trim()),
  MAX_ITEMS_PER_FEED: parseInt(process.env.MAX_ITEMS_PER_FEED || '3')
};
