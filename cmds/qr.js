const qrcode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "qrcode",
  usePrefix: false,
  usage: "qrcode make [text] | qrcode scan (reply to QR image)",
  version: "1.0",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event, args, message }) => {
    const command = args[0];
    const text = args.slice(1).join(" ");

    if (command === "make") {
      if (!text) return message.reply("Please provide text to encode.");
      const filePath = path.join(__dirname, `${Date.now()}.png`);
      await qrcode.toFile(filePath, text);
      message.reply({ body: "Here's your QR code:", attachment: fs.createReadStream(filePath) }, () => fs.unlinkSync(filePath));
    } 
    else if (command === "scan") {
      let imageUrl;
      if (event.type === "message_reply") {
        imageUrl = event.messageReply.attachments[0]?.url;
      } else if (args[1]?.match(/https?:\/\/.*\.(jpg|jpeg|png)/i)) {
        imageUrl = args[1];
      } else {
        return message.reply("Please reply to an image or provide a valid image URL.");
      }

      try {
        const img = await loadImage(imageUrl);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height);
        if (code) {
          message.reply("Decoded QR code text:\n" + code.data);
        } else {
          message.reply("Could not decode QR code.");
        }
      } catch (err) {
        message.reply("Error decoding QR code.");
      }
    } else {
      message.reply("Invalid command. Usage:\nqrcode make [text]\nqrcode scan (reply to image or URL)");
    }
  }
};
