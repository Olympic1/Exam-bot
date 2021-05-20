const fs = require('fs');
const config = require('../../../config.json');

module.exports = {
  name: 'prefix',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander de prefix van de bot.',
    usage: 'prefix <prefix>',
    examples: ['prefix ?', 'prefix -'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de prefix in die u wilt gebruiken.');
    if (config.prefix === args[0]) return message.reply('die prefix gebruik ik nu al.');

    // Change the prefix in the config file and bot
    const newPrefix = args[0];
    config.prefix = newPrefix;

    // Write changes to the config file
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), function(error) {
      if (error) {
        client.log.error(`Er is een fout opgetreden bij het bewerken van de prefix in het configuratiebestand.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het configuratiebestand.');
      }

      client.log.info(`Prefix succesvol veranderd naar \`${newPrefix}\`.`);
    });

    return message.channel.send(`De prefix is succesvol veranderd naar \`${newPrefix}\`.`);
  },
};