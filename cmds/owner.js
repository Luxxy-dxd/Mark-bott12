const axios = require('axios');

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
      const stream = await global.utils.getStreamFromURL(videoURL);

      await api.sendMessage({
        body: message,
        attachment: stream
      }, threadID, messageID);

    } catch (err) {
      console.error('[OWNER CMD ERROR]', err);
      return api.sendMessage("❌ Unable to load owner info or video.", threadID, messageID);
    }
  }
};
