const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports = {
  name: "shoti",
  usePrefix: false,
  usage: "shoti",
  version: "2.0",
  cooldown: 5,
  admin: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID, senderID } = event;
    const filePath = path.join(__dirname, `tik-${senderID}.mp4`);
    const apiUrl = "https://apis-rho-nine.vercel.app/tikrandom";

    const sendVideo = async () => {
      try {
        api.setMessageReaction("⏳", messageID, () => {}, true);

        const response = await axios.get(apiUrl);
        const videoUrl = response.data?.playUrl;

        if (!videoUrl) {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return api.sendMessage("⚠️ No video URL received from the API.", threadID, messageID);
        }

        const videoStream = await axios({
          url: videoUrl,
          method: "GET",
          responseType: "stream",
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on("finish", () => {
          api.setMessageReaction("✅", messageID, () => {}, true);

          api.sendMessage(
            {
              body: `🎥 Here's your random TikTok video!`,
              attachment: fs.createReadStream(filePath),
              buttons: [
                {
                  label: "🔁 Again",
                  type: "postback",
                  payload: "SHOTI_RETRY",
                },
              ],
            },
            threadID,
            () => fs.existsSync(filePath) && fs.unlinkSync(filePath)
          );
        });

        writer.on("error", (err) => {
          console.error("❌ Write error:", err);
          api.sendMessage("⚠️ Failed to save the video.", threadID, messageID);
        });
      } catch (err) {
        console.error("❌ TikTok error:", err);
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("⚠️ Could not fetch video. Please try again later.", threadID, messageID);
      }
    };

    // Handle retry button
    if (event.postback && event.postback.payload === "SHOTI_RETRY") {
      return sendVideo();
    }

    // First request
    return sendVideo();
  },
};
