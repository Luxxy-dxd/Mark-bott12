const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  name: "shoti",
  usePrefix: false,
  usage: "shoti",
  version: "1.2",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const response = await axios.get("https://apis-rho-nine.vercel.app/tikrandom");
      if (!response.data?.playUrl) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage("⚠️ No video URL from API.", threadID, messageID);
      }

      const videoUrl = response.data.playUrl;
      const filePath = path.join(__dirname, "tikrandom.mp4");
      const writer = fs.createWriteStream(filePath);

      const videoResponse = await axios({ url: videoUrl, method: "GET", responseType: "stream" });
      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        api.setMessageReaction("✅", messageID, () => {}, true);
        api.sendMessage({ body: "🎥 Here's a random TikTok video:", attachment: fs.createReadStream(filePath) }, threadID, () => {
          fs.unlink(filePath, () => {});
        });
      });

      writer.on("error", () => {
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("❌ Failed to download video.", threadID, messageID);
      });

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
