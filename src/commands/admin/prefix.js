const fs = require('fs');
const filePath = '../../../config.json';
const configFile = require(filePath);

module.exports = {
  name: 'prefix',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: `Verander de prefix van de bot.`,
    usage: 'prefix <nieuwe prefix>',
    examples: ['prefix ?', 'prefix -']
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('Voer de prefix in dat u wilt instellen.');
    if (client.config.prefix === args[0]) return message.reply('Die prefix is al in gebruik.');

    // Change the prefix in the config file and bot
    const newPrefix = args[0];
    configFile.prefix = newPrefix;
    client.config.prefix = newPrefix;

    // Write changes to the config file
    fs.writeFile(filePath, JSON.stringify(configFile, null, 2), function (err) {
      if (err) return console.log(err);
    });

    // Update activity with the new prefix
    client.user.setPresence({
      status: 'online',
      activity: {
        name: `${newPrefix}help`,
        type: 'LISTENING'
      }
    }).catch((error) => {
      console.error(`An error occurred when trying to set the status of the bot after changing the prefix.\n${error}`);
      message.channel.send(`Er is een fout opgetreden bij het instellen van de status met de nieuwe prefix.`);
    });

    return message.reply(`Prefix succesvol veranderd naar \`${newPrefix}\`.`);
  }
}