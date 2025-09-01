const TelegramBot = require("node-telegram-bot-api");
const fetchAllNews = require("../services/fetchNews");
const { BOT_TOKEN, CHAT_ID } = require("../config");
const { load } = require("cheerio");

const bot = new TelegramBot(BOT_TOKEN);

function cleanDescription(desc, maxLength = 800) {
  if (!desc) return "";

  const $ = load(desc);

  // Ambil teks saja, buang semua tag
  let text = $.text().trim();

  // Hapus bagian "More RSS Feeds" ke belakang
  const cutIndex = text.indexOf("More RSS Feeds");
  if (cutIndex !== -1) {
    text = text.substring(0, cutIndex).trim();
  }

  // Biar nggak bikin error Telegram kalau kepanjangan
  if (text.length > maxLength) {
    text = text.substring(0, maxLength).trim() + "...";
  }

  return text;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function sendNews() {
  let newsList = await fetchAllNews();
  if (!newsList.length) {
    console.log("[sendNews] News is not found");
    return;
  }

  // Acak sebelum dikirim
  newsList = shuffleArray(newsList);

  let message = "<b>B2B ICT News:</b>\n\n";

  newsList.forEach((news, index) => {
    const cleanDesc = cleanDescription(news.description);

    message += `📰 <b>${index + 1}. ${news.title}</b>\n`;
    message += `🔗 ${news.link}\n`;
    if (cleanDesc) {
      message += `📝 ${cleanDesc}\n`;
    }
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
