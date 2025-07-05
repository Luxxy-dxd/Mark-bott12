module.exports.config = {
  name: "id",
  usePrefix: false,
  usage: "id [@mention]",
  version: "1.1",
  admin: false,
  cooldown: 2
};

module.exports.run = async function ({ api, event, usersData }) {
  const { threadID, messageID, senderID, mentions } = event;

  let uid;
  let userName;

  if (Object.keys(mentions).length > 0) {
    uid = Object.keys(mentions)[0];
    userName = mentions[uid].replace("@", "");
  } else {
    uid = senderID;
    userName = "You";
  }

  try {
    const userInfo = await api.getUserInfo(uid);
    const user = userInfo[uid];
    const avatarUrl = await usersData.getAvatarUrl(uid);

    const profileLink = user.profileUrl || `https://facebook.com/${uid}`;

    const messageBody = `
🔍 Facebook UID: ${uid}
📛 Name: ${user.name}
🔗 Profile: ${profileLink}
    `.trim();

    await api.sendMessage({
      body: messageBody,
      attachment: await global.utils.getStreamFromURL(avatarUrl),
      buttons: [
        {
          type: "reply",
          label: "🔄 Get My ID",
          id: "ID_MYSELF"
        },
        {
          type: "reply",
          label: "🔍 Spy User",
          id: `ID_SPY_${uid}`
        }
      ]
    }, threadID, messageID);

  } catch (error) {
    return api.sendMessage("❌ Failed to fetch user info.", threadID, messageID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID, senderID } = event;

  if (body === "ID_MYSELF") {
    return module.exports.run({ api, event: { ...event, senderID, mentions: {} } });
  }

  if (body?.startsWith("ID_SPY_")) {
    const uid = body.replace("ID_SPY_", "");
    return api.sendMessage(`You chose to spy user: ${uid}`, threadID, messageID);
    // You can call your spy command logic here instead
  }
};
