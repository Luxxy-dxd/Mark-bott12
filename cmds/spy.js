const axios = require("axios");

module.exports = {
  name: "spy",
  usePrefix: false,
  usage: "spy [@mention|profile_link|UID]",
  version: "2.0",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event, args, usersData }) => {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    let targetUID = senderID;

    // 1. Mention
    if (Object.keys(mentions).length > 0) {
      targetUID = Object.keys(mentions)[0];
    }

    // 2. Reply
    else if (messageReply) {
      targetUID = messageReply.senderID;
    }

    // 3. Profile link or direct UID
    else if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        targetUID = args[0];
      } else {
        const match = args[0].match(/(?:id=)?(\d{6,})/);
        if (match) targetUID = match[1];
      }
    }

    // 4. Fallback
    if (!targetUID) {
      return api.sendMessage("⚠️ Could not identify the target user.", threadID, messageID);
    }

    try {
      const userInfo = await new Promise((resolve, reject) =>
        api.getUserInfo(targetUID, (err, res) => {
          if (err || !res?.[targetUID]) reject(err || "User not found");
          else resolve(res[targetUID]);
        })
      );

      const avatarUrl = await usersData.getAvatarUrl(targetUID);

      const gender =
        userInfo.gender === 1
          ? "🚺 Female"
          : userInfo.gender === 2
          ? "🚹 Male"
          : "⚪ Unknown";

      const response = `
╔════════════════════╗
      🕵️ USER SPY REPORT
╚════════════════════╝

👤 Name       : ${userInfo.name}
🆔 UID        : ${targetUID}
🔗 Profile    : https://facebook.com/${targetUID}
⚧️ Gender     : ${gender}
🎂 Birthday   : ${userInfo.isBirthday ? "🎉 Yes" : "❌ No"}
🤝 Is Friend  : ${userInfo.isFriend ? "✅ Yes" : "❌ No"}
🏷️ Type       : ${userInfo.type || "Unknown"}
`;

      return api.sendMessage(
        {
          body: response,
          attachment: await global.utils.getStreamFromURL(avatarUrl),
          buttons: [
            {
              label: "📂 View Profile",
              type: "web_url",
              url: `https://facebook.com/${targetUID}`,
            },
          ],
        },
        threadID,
        messageID
      );
    } catch (err) {
      console.error("❌ Spy error:", err);
      return api.sendMessage("❌ Failed to retrieve user info.", threadID, messageID);
    }
  },
};
