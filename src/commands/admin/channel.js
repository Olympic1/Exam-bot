const fs = require('fs');
const filePath = '../../../config.json';
const configFile = require(filePath);

module.exports = {
  name: 'channel',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander het kanaal waarin de bot de succes-berichten stuurt.',
    usage: 'channel <nieuw kanaalID>',
    examples: ['channel 838084030062264320'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer het ID van het kanaal in waar u de berichten wil laten zien.');
    if (client.config.examChannel === args[0]) return message.reply('dat kanaal gebruik ik nu al.');

    // Change the examChannel in the config file and bot
    const newChannel = args[0];
    configFile.examChannel = newChannel;
    client.config.examChannel = newChannel;

    // Write changes to the config file
    fs.writeFile(filePath, JSON.stringify(configFile, null, 2), function(error) {
      if (error) {
        console.error(`An error occurred when trying to write the channel to the config file.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het config bestand.');
      }

      console.info(`Channel successfully changed to \`${newChannel}\`.`);
    });

    const channelID = message.guild.channels.cache.get(newChannel);
    return message.channel.send(`Het kanaal is succesvol veranderd naar ${channelID.toString()}.`);
  },
};