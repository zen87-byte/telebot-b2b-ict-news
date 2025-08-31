// api/news.js
import sendNews from "../bot/sendNews.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await sendNews(); // kirim berita ke Telegram
      res.status(200).json({ message: "News sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send news" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
