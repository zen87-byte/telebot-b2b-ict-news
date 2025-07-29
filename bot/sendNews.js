const TelegramBot = require("node-telegram-bot-api");
const fetchAllNews = require("../services/fetchNews");
const { BOT_TOKEN, CHAT_ID } = require("../config");

const bot = new TelegramBot(BOT_TOKEN);

async function sendNews() {
  const newsList = await fetchAllNews();
  if (!newsList.length) {
    console.log("[sendNews] News is not found");
    return;
  }

  let message = "*B2B ICT News:*\n\n";

  newsList.forEach((news, index) => {
    message += `📰 *${index + 1}. ${news.title}*\n🔗 ${news.link}\n\n`;
  });

  try {
    await bot.sendMessage(CHAT_ID, message, { parse_mode: "Markdown" });
    console.log("[sendNews] All news already send successfully");
  } catch (err) {
    console.error("[sendNews] Failed to send the news:", err.message);
  }
}

module.exports = sendNews;
