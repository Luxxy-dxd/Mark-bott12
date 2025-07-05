const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "owner",
  usePrefix: false,
  usage: "owner",
  version: "2.0",
  admin: false,
  cooldown: 5,

  execute: async function({ api, event }) {
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
    const cachePath = path.join(__dirname, 'cache');
    const videoPath = path.join(cachePath, 'owner_video.mp4');

    try {
      if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

      const buffer = (await axios.get(videoURL, { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(videoPath, Buffer.from(buffer));

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

      // Send video with info as caption
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, threadID, () => {
        fs.unlinkSync(videoPath);
      }, messageID);

    } catch (err) {
      console.error('[OWNER CMD ERROR]', err);
      return api.sendMessage("❌ Unable to load owner info.", threadID, messageID);
    }
  }
};
