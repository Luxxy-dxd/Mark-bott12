const fs = require("fs");
const path = require("path");
const configPath = "./config.json";
let config = JSON.parse(fs.readFileSync(configPath));

module.exports.config = {
  name: "changeprefix",
  usePrefix: false,
  usage: "changeprefix",
  version: "1.0",
  admin: true,
  cooldown: 2
};

module.exports.run = async function ({ api, event }) {
  const { senderID, threadID, messageID } = event;

  if (senderID !== config.ownerID) {
    return api.sendMessage("❌ Only the bot owner can use this command.", threadID, messageID);
  }

  return api.sendMessage({
    body: `🤖 Bot Settings\n\n📌 Current Prefix: ${config.prefix}\n🆔 Bot Name: ${config.botName}`,
    attachment: await global.utils.getStreamFromURL("https://media.giphy.com/media/1UwhOK8VX95TcfPBML/giphy.gif"),
    buttons: [
      {
        type: "reply",
        label: "✏️ Change Prefix",
        id: `CHANGE_PREFIX`
      }
    ]
  }, threadID, messageID);
};

module.exports.handleEvent = async function ({ api, event }) {
  const { type, messageReply, senderID, threadID, messageID, body } = event;
  const configPath = "./config.json";
  let config = JSON.parse(fs.readFileSync(configPath));

  if (type === "message_reply" && messageReply?.body?.includes("Bot Settings") && senderID === config.ownerID) {
    const newPrefix = body.trim();
    if (newPrefix.length > 3) return api.sendMessage("❌ Prefix too long. Try something shorter (1–3 characters).", threadID, messageID);

    config.prefix = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return api.sendMessage(`✅ Prefix successfully updated to: ${newPrefix}`, threadID, messageID);
  }
};
