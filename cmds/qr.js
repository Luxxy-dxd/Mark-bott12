const qrcode = require('qrcode');
const jimp = require('jimp');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "qrcode",
  usePrefix: false,
  usage: "qrcode make <text> | qrcode scan (reply to image)",
  version: "1.0",
  admin: false,
  cooldown: 2
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply, type } = event;
  const command = args[0];
  const text = args.slice(1).join(" ");

  if (command === "make") {
    if (!text) return api.sendMessage("⚠️ Please provide text to convert to QR code.", threadID, messageID);

    const filePath = path.join(__dirname, `qr_${Date.now()}.jpeg`);
    try {
      await qrcode.toFile(filePath, text);
      return api.sendMessage({
        body: "✅ Here's your QR code:",
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.existsSync(filePath) && fs.unlinkSync(filePath), messageID);
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Failed to generate QR code.", threadID, messageID);
    }

  } else if (command === "scan") {
    let imageUrl = null;

    if (type === "message_reply" && messageReply?.attachments?.[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } else if (args[1]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/gi)) {
      imageUrl = args[1];
    } else {
      return api.sendMessage("📸 Please reply to a QR image or provide an image URL.", threadID, messageID);
    }

    try {
      const decodedText = await decodeQRCode(imageUrl);
      if (decodedText) {
        return api.sendMessage(`📤 QR Code Result:\n\n${decodedText}`, threadID, messageID);
      } else {
        return api.sendMessage("❌ Unable to decode the QR code.", threadID, messageID);
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error while decoding the image.", threadID, messageID);
    }

  } else {
    return api.sendMessage(
      `⚠️ Invalid input.\n\n✅ Usage:\n• qrcode make <text>\n• qrcode scan (reply to QR image)\n\n📌 Example:\n• qrcode make I am Luffy\n• [reply to image] qrcode scan`,
      threadID,
      messageID
    );
  }
};

async function decodeQRCode(imageUrl) {
  const image = await loadImage(imageUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code ? code.data : null;
}
