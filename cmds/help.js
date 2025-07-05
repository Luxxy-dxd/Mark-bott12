module.exports = {
  name: "help",
  usePrefix: false,
  usage: "help [command_name] | help all",
  version: "2.0",

  execute({ api, event, args }) {
    const { threadID, messageID } = event;

    const allCommands = Array.from(global.commands.values()).sort((a, b) => a.name.localeCompare(b.name));
    const nonAdminCommands = allCommands.filter(cmd => !cmd.admin);

    const formatCommand = (cmd, index) => 
      `🔹 ${index + 1}. ${cmd.name.toUpperCase()}
      ├─ 📎 Usage: ${cmd.usage}
      ├─ 🧩 Prefix: ${cmd.usePrefix ? "Required ✅" : "Not Required ❌"}
      ├─ 🔒 Admin: ${cmd.admin ? "Yes 🔐" : "No 🔓"}
      └─ 🧪 Version: ${cmd.version}`;

    if (args.length > 0) {
      const commandName = args[0].toLowerCase();

      if (commandName === "all") {
        const formattedAll = nonAdminCommands
          .map((cmd, i) => formatCommand(cmd, i))
          .join("\n\n");

        const allHelpMessage = `
╔══════════════════════════╗
    🤖 ALL AVAILABLE COMMANDS 🤖
╚══════════════════════════╝

${formattedAll}

📘 Tip: Use "help [command]" to get detailed info about a specific command.
        `;

        return api.sendMessage(allHelpMessage, threadID, messageID);
      }

      // Show details of a specific command
      const command = global.commands.get(commandName);
      if (!command) {
        return api.sendMessage(`❌ Command '${commandName}' not found. Please check the name and try again.`, threadID, messageID);
      }

      const commandDetails = `
╔════════════════════╗
   ℹ️ COMMAND DETAILS ℹ️
╚════════════════════╝

🔹 Name: ${command.name}
🔹 Usage: ${command.usage}
🔹 Prefix Required: ${command.usePrefix ? "✅ Yes" : "❌ No"}
🔹 Admin Only: ${command.admin ? "✅ Yes" : "❌ No"}
🔹 Version: ${command.version}

📘 Type "help all" to see a list of all available commands.
      `;

      return api.sendMessage(commandDetails, threadID, messageID);
    }

    // Show random 5 non-admin commands
    const shuffled = nonAdminCommands.sort(() => 0.5 - Math.random());
    const previewCommands = shuffled.slice(0, 5).map((cmd, i) => formatCommand(cmd, i)).join("\n\n");

    const helpPreview = `
╔═══════════════════════╗
      🤖 BOT COMMANDS 🤖
╚═══════════════════════╝

📍 Here are 5 random commands you can try:

${previewCommands}

🛠️ Use: "help all" to view all commands.
🔍 Use: "help [command]" to see detailed usage.
    `;

    return api.sendMessage(helpPreview, threadID, messageID);
  }
};
