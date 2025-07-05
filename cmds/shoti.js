const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "shoti",
  usePrefix: false,
  usage: "shoti",
  version: "1.1",
  admin: false,
  cooldown: 5
};

async function sendVideo(api, threadID, messageID) {
  const filePath = path.join(__dirname, "tikrandom.mp4");

  try {
    await api.setMessageReaction("⏳", messageID, () => {}, true);

    const response = await axios.get("https://apis-rho-nine.vercel.app/tikrandom");
    if (!response.data || !response.data.playUrl) {
      await api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("⚠️ No video URL received from API.", threadID, messageID);
    }

    const videoUrl = response.data.playUrl;
    const videoResponse = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    videoResponse.data.pipe(writer);

    writer.on("finish", async () => {
      await api.setMessageReaction("✅", messageID, () => {}, true);

      api.sendMessage({
        body: "🎥 Here is a random TikTok video!\n",
        attachment: fs.createReadStream(filePath),
        buttons: [
          { type: "reply", label: "🎬 Again", id: "SHOTI_AGAIN" }
        ]
      }, threadID, (err) => {
        if (err) {
          console.error("❌ Error sending video:", err);
          api.sendMessage("⚠️ Failed to send video.", threadID);
        }
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error("❌ Error deleting file:", unlinkErr);
        });
      }, messageID);
    });

    writer.on("error", async (err) => {
      console.error("❌ Error downloading video:", err);
      await api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage("⚠️ Failed to download video.", threadID, messageID);
    });

  } catch (error) {
    console.error("❌ Error fetching video:", error);
    await api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`⚠️ Could not fetch the video. Error: ${error.message}`, threadID, messageID);
  }
}

module.exports.run = async function({ api, event }) {
  await sendVideo(api, event.threadID, event.messageID);
};

module.exports.handleEvent = async function({ api, event }) {
  const { body, threadID, messageID } = event;

  if (body === "SHOTI_AGAIN") {
    await sendVideo(api, threadID, messageID);
  }
};
