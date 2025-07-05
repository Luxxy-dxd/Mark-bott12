module.exports = {
  name: "id",
  usePrefix: false,
  usage: "id [@mention]",
  version: "1.0",
  admin: false,
  cooldown: 10,

  execute: async ({ api, event, mentions }) => {
    const { threadID, messageID, senderID } = event;

    let uid, name;
    if (Object.keys(mentions).length > 0) {
      uid = Object.keys(mentions)[0];
      name = mentions[uid].replace("@", "") || "User";
    } else {
      uid = senderID;
      name = "You";
    }

    api.sendMessage(`🔍 Facebook UID for ${name}: ${uid}`, threadID, messageID);
  }
};
