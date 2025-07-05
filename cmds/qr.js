const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const jsQR = require("jsqr");

module.exports = {
  name: "qrcode",
  usePrefix: false,
  usage: "qrcode make [text] | qrcode scan (with reply)",
  version: "2.0",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID, type, messageReply, senderID } = event;
    const action = args[0];
    const content = args.slice(1).join(" ");
    const tempPath = path.join(__dirname, `qr-${senderID}.png`);

    if (!action) {
      return api.sendMessage(
        {
          body: "⚙️ Choose an action for QR Code:",
          buttons: [
            { label: "🧾 Make QR", type: "postback", payload: "QR_MAKE" },
            { label: "📷 Scan QR", type: "postback", payload: "QR_SCAN" }
          ]
        },
        threadID,
        messageID
      );
    }

    if (action === "make") {
      if (!content) return api.sendMessage("❌ Please provide text to encode.\nUsage: qrcode make [text]", threadID, messageID);

      try {
        await qrcode.toFile(tempPath, content);
        return api.sendMessage({
          body: `✅ QR Code generated for:\n"${content}"`,
          attachment: fs.createReadStream(tempPath)
        }, threadID, () => fs.unlinkSync(tempPath), messageID);
      } catch (err) {
        console.error("QR Code Generation Error:", err);
        return api.sendMessage("❌ Failed to generate QR code.", threadID, messageID);
      }
    }

    if (action === "scan") {
      let imageUrl;

      if (type === "message_reply" && messageReply.attachments?.[0]?.type === "photo") {
        imageUrl = messageReply.attachments[0].url;
      } else {
        return api.sendMessage("📷 Please reply to a QR image to scan.", threadID, messageID);
      }

      try {
        const image = await loadImage(imageUrl);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (!code) return api.sendMessage("❌ Failed to decode QR Code.", threadID, messageID);

        return api.sendMessage(`📤 QR Code Content:\n\n${code.data}`, threadID, messageID);
      } catch (err) {
        console.error("QR Decode Error:", err);
        return api.sendMessage("❌ Error decoding QR code.", threadID, messageID);
      }
    }

    return api.sendMessage("⚠️ Invalid option. Use:\n- qrcode make [text]\n- qrcode scan (with reply)", threadID, messageID);
  },

  onPostback: async ({ api, event }) => {
    const { threadID, messageID, postback, senderID } = event;
    const payload = postback?.payload;
    const tempPath = path.join(__dirname, `qr-${senderID}.png`);

    if (payload === "QR_MAKE") {
      return api.sendMessage("✏️ Enter the text you want to convert to a QR code:\nUsage: `qrcode make your text`", threadID, messageID);
    }

    if (payload === "QR_SCAN") {
      return api.sendMessage("📸 Please reply to a QR image with:\n`qrcode scan`", threadID, messageID);
    }
  }
};
