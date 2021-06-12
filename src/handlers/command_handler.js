const { readdirSync } = require('fs');
const { BotClient } = require('../typings');
const permissionList = require('../permissions');

/** @param {BotClient} client */
module.exports = (client) => {
  // Get all the folders in 'commands/'
  const commandFolders = readdirSync('./src/commands');

  for (const folder of commandFolders) {
    // Get all the JavaScript files in the folder
    const commandFiles = readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

    // Add all the found commands
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);

      const { name, permissions, info, execute } = command;
      const { description, examples } = info;

      // Check if the command has a name
      if (!name) {
        client.log.error(`Het commando in "${file}" heeft geen naam ingesteld.`);
        continue;
      }

      // Check if the name is a string
      if (typeof name !== 'string') {
        client.log.error(`Het commando in "${file}" heeft geen string als naam.`);
        continue;
      }

      // Check if there is an invalid permission in the command
      if (permissions.length) {
        for (const perm of permissions) {
          if (!permissionList.includes(perm)) {
            client.log.error(`Het commando in "${file}" heeft een ongeldige permissie ingesteld: ${perm}. Permissies moeten allemaal hoofdletters zijn en één van de volgende zijn: "${[...permissionList].join('", "')}".`);
            continue;
          }
        }
      }

      // Check if the command has a description
      if (!description) {
        client.log.warn(`Het commando "${name}" heeft geen beschrijving ingesteld.`);
      }

      // Check if the command has a example
      if (!examples.length) {
        client.log.warn(`Het commando "${name}" heeft geen voorbeelden ingesteld.`);
      }

      // Check if the command has a execution
      if (typeof execute !== 'function') {
        client.log.error(`Het commando in "${file}" heeft geen "execute" functie ingesteld.`);
        continue;
      }

      // Add the command to bot
      client.commands.set(name, command);
    }
  }
};