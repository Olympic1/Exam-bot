const fs = require('fs');

module.exports = (client) => {
  // Get all the folders in 'commands/'
  const commandFolders = fs.readdirSync('./src/commands');

  for (const folder of commandFolders) {
    // Get all the JavaScript files in the folder
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

    // Add all the found commands
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.name, command);
    }
  }
};