module.exports.config = {
  name: "spy",
  usePrefix: false,
  usage: "spy [uid | profile link | mention | reply]",
  version: "1.0",
  admin: false,
  cooldown: 2
};

module.exports.run = async function ({ api, event, args, usersData }) {
  const { threadID, messageID, senderID, messageReply, type, mentions } = event;
  let uid;

  if (args[0]) {
    if (/^\d+$/.test(args[0])) {
      uid = args[0];
    } else {
      const match = args[0].match(/profile\.php\?id=(\d+)/);
      if (match) uid = match[1];
    }
  }

  if (!uid) {
    uid = type === "message_reply"
      ? messageReply.senderID
      : Object.keys(mentions)[0] || senderID;
  }

  api.getUserInfo(uid, async (err, result) => {
    if (err) return api.sendMessage("❌ Failed to get user info.", threadID, messageID);

    const user = result[uid];
    const avatar = await usersData.getAvatarUrl(uid);

    let gender = "Unknown";
    if (user.gender === 1) gender = "Girl";
    else if (user.gender === 2) gender = "Boy";

    const info = `
📛 Name: ${user.name}
🌐 Profile: ${user.profileUrl}
⚧️ Gender: ${gender}
👤 Type: ${user.type}
👥 Friend: ${user.isFriend ? "Yes" : "No"}
🎂 Birthday Today: ${user.isBirthday ? "Yes" : "No"}
    `.trim();

    return api.sendMessage({
      body: info,
      attachment: await global.utils.getStreamFromURL(avatar)
    }, threadID, messageID);
  });
};
