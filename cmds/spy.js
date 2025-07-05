module.exports.config = {
  name: "spy",
  usePrefix: false,
  usage: "spy [uid | profile link | mention | reply | group]",
  version: "2.0",
  admin: false,
  cooldown: 2
};

module.exports.run = async function ({ api, event, args, usersData }) {
  const { threadID, messageID, senderID, messageReply, type, mentions } = event;

  // Detect group batch mode
  if (args[0]?.toLowerCase() === "group") {
    const threadInfo = await api.getThreadInfo(threadID);
    const memberIDs = threadInfo.participantIDs.slice(0, 5); // limit to 5 for performance

    for (const id of memberIDs) {
      await sendUserInfo(id, api, threadID);
    }

    return api.sendMessage(`✅ Spied on ${memberIDs.length} group members.`, threadID, messageID);
  }

  let uid = null;

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

  return sendUserInfo(uid, api, threadID, messageID);
};

async function sendUserInfo(uid, api, threadID, messageID) {
  try {
    const info = await api.getUserInfo(uid);
    const user = info[uid];
    const avatar = await global.utils.getStreamFromURL(
      await global.utils.getAvatarUrl(uid)
    );

    const gender = user.gender === 2 ? "👦 Boy" : user.gender === 1 ? "👧 Girl" : "❓ Unknown";

    const profileText = `
📛 Name: ${user.name}
🆔 UID: ${uid}
🌐 Profile: ${user.profileUrl}
⚧️ Gender: ${gender}
👤 Type: ${user.type}
👥 Friend: ${user.isFriend ? "Yes" : "No"}
🎂 Birthday Today: ${user.isBirthday ? "Yes" : "No"}
`.trim();

    const messagePayload = {
      body: profileText,
      attachment: avatar
    };

    const msg = await api.sendMessage(messagePayload, threadID, messageID);

    // Add retry button (postback simulation)
    setTimeout(() => {
      api.sendMessage({
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `🔍 Want to spy again?`,
            buttons: [
              {
                type: "postback",
                title: "🔁 Spy Myself Again",
                payload: `SPY_${uid}`
              },
              {
                type: "postback",
                title: "👥 Spy Group (5)",
                payload: `SPY_GROUP`
              }
            ]
          }
        }
      }, threadID);
    }, 1000);
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ Error getting user info.", threadID, messageID);
  }
}

module.exports.handleEvent = async function ({ api, event }) {
  const { type, postback, threadID, messageID, senderID } = event;

  if (type !== "postback") return;

  if (postback?.payload?.startsWith("SPY_")) {
    const uid = postback.payload.replace("SPY_", "");
    return sendUserInfo(uid, api, threadID, messageID);
  }

  if (postback?.payload === "SPY_GROUP") {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs.slice(0, 5);

    for (const id of members) {
      await sendUserInfo(id, api, threadID);
    }

    return api.sendMessage(`📡 Spied on 5 random group members!`, threadID, messageID);
  }
};
