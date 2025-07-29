const sendNews = require("../bot/sendNews");

module.exports = async (req, res) => {
  try {
    await sendNews();
    res.status(200).json({ message: "Sending news successfully" });
  } catch (err) {
    console.error("[API] Failed to send the news:", err.message);
    res.status(500).json({ error: "Failed to send the news" });
  }
};
