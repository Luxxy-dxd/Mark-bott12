const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "owner",
  usePrefix: false,
  usage: "owner",
  version: "2.0"
};

module.exports.run = async function({ api, event }) {
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

🧠 Use the buttons below to explore more.
    `.trim();

    await api.sendMessage({
      body: message,
      attachment: fs.createReadStream(videoPath)
    }, threadID, () => {
      fs.unlinkSync(videoPath);
    }, messageID);

    setTimeout(() => {
      api.sendMessage({
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `🔘 What do you want to do next?`,
            buttons: [
              {
                type: "web_url",
                url: ownerInfo.fb,
                title: "📩 Contact Owner"
              },
              {
                type: "postback",
                title: "ℹ️ About Bot",
                payload: "ABOUT_BOT"
              }
            ]
          }
        }
      }, threadID, messageID);
    }, 1500);

  } catch (err) {
    console.error('[OWNER CMD ERROR]', err);
    return api.sendMessage("❌ Unable to load owner info.", threadID, messageID);
  }
};

module.exports.handleEvent = async function({ api, event }) {
  if (event.type === "postback" && event.postback.payload === "ABOUT_BOT") {
    const about = `
🤖 This bot was created and managed by Luffy a.k.a RedRat.
🧠 Built using Node.js with love and code.
✨ Stay tuned for more amazing features!
    `.trim();
    api.sendMessage(about, event.threadID, event.messageID);
  }
};
