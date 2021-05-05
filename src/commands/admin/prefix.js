const fs = require('fs');
const filePath = '../../../config.json';
const configFile = require(filePath);

module.exports = {
  name: 'prefix',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander de prefix van de bot.',
    usage: 'prefix <nieuwe prefix>',
    examples: ['prefix ?', 'prefix -'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de prefix in die u wilt gebruiken.');
    if (client.config.prefix === args[0]) return message.reply('die prefix gebruik ik nu al.');

    // Change the prefix in the config file and bot
    const newPrefix = args[0];
    configFile.prefix = newPrefix;
    client.config.prefix = newPrefix;

    // Write changes to the config file
    fs.writeFile(filePath, JSON.stringify(configFile, null, 2), function(error) {
      if (error) {
        console.error(`An error occurred when trying to write the prefix to the config file.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het config bestand.');
      }

      console.info(`Prefix successfully changed to \`${newPrefix}\`.`);
    });

    return message.channel.send(`De prefix is succesvol veranderd naar \`${newPrefix}\`.`);
  },
};