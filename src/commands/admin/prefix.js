const fs = require('fs');

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
    if (client.config.prefix === args[0]) return message.reply('die prefix gebruik ik nu al.');

    // Change the prefix in the config file and bot
    const newPrefix = args[0];
    client.config.prefix = newPrefix;

    // Write changes to the config file
    fs.writeFile('./config.json', JSON.stringify(client.config, null, 2), function(error) {
      if (error) {
        console.error(`Er is een fout opgetreden bij het bewerken van de prefix in het configuratiebestand.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het configuratiebestand.');
      }

      console.info(`Prefix succesvol veranderd naar \`${newPrefix}\`.`);
    });

    return message.channel.send(`De prefix is succesvol veranderd naar \`${newPrefix}\`.`);
  },
};