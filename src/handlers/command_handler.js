const fs = require('fs');
const permissionList = require('../utils/permissions');

module.exports = (client) => {
  // Get all the folders in 'commands/'
  const commandFolders = fs.readdirSync('./src/commands');

  for (const folder of commandFolders) {
    // Get all the JavaScript files in the folder
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

    // Add all the found commands
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);

      // Check if there is an invalid permission in the command
      if (command.permissions.length) {
        for (const perm of command.permissions) {
          if (!permissionList.includes(perm)) client.log.warn(`Het commando '${command.name}' heeft een ongeldige permissie ingesteld: ${perm}`);
        }
      }

      // Add command to bot
      client.commands.set(command.name, command);
    }
  }
};