module.exports = {
  name: "id",
  usePrefix: false,
  usage: "id [@mention or reply or link or UID]",
  version: "2.0",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, senderID, mentions, type, messageReply } = event;

    let targetID = senderID;
    let targetName = "You";

    // Mentioned
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetName = mentions[targetID].replace(/@/g, "");
    }

    // Replied user
    else if (type === "message_reply") {
      targetID = messageReply.senderID;
      targetName = messageReply.senderID === senderID ? "You" : "User from replied message";
    }

    // Direct UID or profile link
    else if (args[0]) {
      const arg = args[0];
      if (/^\d{5,}$/.test(arg)) {
        targetID = arg;
        targetName = "User";
      } else {
        const match = arg.match(/id=(\d{5,})/); // profile.php?id=
        if (match) {
          targetID = match[1];
          targetName = "User";
        }
      }
    }

    const profileLink = `https://facebook.com/${targetID}`;

    return api.sendMessage({
      body: `🔍 UID Information\n\n👤 Name: ${targetName}\n🆔 UID: ${targetID}\n🔗 Profile: ${profileLink}`,
      buttons: [
        { label: "📋 Copy UID", type: "reply", payload: targetID },
        { label: "🌐 View Profile", type: "url", url: profileLink }
      ]
    }, threadID, messageID);
  }
};
