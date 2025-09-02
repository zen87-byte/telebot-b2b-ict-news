const TelegramBot = require("node-telegram-bot-api");
const fetchAllNews = require("../services/fetchNews");
const { BOT_TOKEN, CHAT_ID } = require("../config");
const { load } = require("cheerio");

const bot = new TelegramBot(BOT_TOKEN);

async function sendNews() {
  let newsList = await fetchAllNews();
  if (!newsList.length) {
    console.log("[sendNews] News is not found");
    return;
  }

  let message = "<b>B2B ICT News:</b>\n\n";

  newsList.forEach((news, index) => {
    message += `📰 <b>${index + 1}. ${news.title}</b>\n`;
    message += `🔗 ${news.link}\n`;
    message += `\n`;
  });

  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
    console.log("[sendNews] All news already send successfully");
  } catch (err) {
    console.error("[sendNews] Failed to send the news:", err.message);
  }
}

module.exports = sendNews;
