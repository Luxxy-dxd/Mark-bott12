const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "owner",
  usePrefix: false,
  usage: "owner",
  version: "2.0",
  admin: false,
  cooldown: 5,

  execute: async function ({ api, event }) {
    const { threadID, messageID } = event;

    const ownerInfo = {
      name: 'Luffy',
      gender: 'Male',
      age: '19',
      height: '170cm',
      nick: 'RedRat',
      fb: 'https://www.facebook.com/82ijejejjeie2i227272uwwuueu22u'
    };

    const videoURL = 'https://i.imgur.com/DDO686J.mp4';
    const tempPath = path.join(__dirname, "owner_media.mp4");

    const message = `
╔══════════════════════╗
   👑 BOT OWNER INFO 👑
╚══════════════════════╝

🧾 Name   : ${ownerInfo.name}
🚹 Gender : ${ownerInfo.gender}
🎂 Age    : ${ownerInfo.age}
📏 Height : ${ownerInfo.height}
🐾 Nick   : ${ownerInfo.nick}

📩 Contact Owner: ${ownerInfo.fb}
    `.trim();

    try {
      const response = await axios({
        url: videoURL,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        api.sendMessage({
          body: message,
          attachment: fs.createReadStream(tempPath),
        }, threadID, () => fs.unlinkSync(tempPath), messageID);
      });

      writer.on("error", (err) => {
        console.error("❌ Error writing file:", err);
        api.sendMessage("❌ Failed to send owner info.", threadID, messageID);
      });

    } catch (err) {
      console.error("[OWNER CMD ERROR]", err);
      return api.sendMessage("❌ Unable to load owner info or video.", threadID, messageID);
    }
  }
};
