// bot/sendNews.js
import fetchNews from "../services/fetchNews.js";
import fetch from "node-fetch";

const sendNews = async () => {
  const newsList = await fetchNews();

  if (!newsList || newsList.length === 0) {
    console.log("No news fetched");
    return;
  }

  const token = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  for (const news of newsList) {
    const message = `📰 ${news.title}\n🔗 ${news.link}\n${news.description || ""}`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true
      })
    });

    const data = await res.json();
    console.log("Telegram response:", data);
  }
};

export default sendNews;
