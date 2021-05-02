const fs = require('fs');
const filePath = '../../../config.json';
const configFile = require(filePath);

module.exports = {
  name: 'cron',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Allerlei acties met betrekking tot CronJob.',
    usage: 'cron <actie>',
    examples: ['cron status', 'cron start', 'cron stop', 'cron last', 'cron next']
  },
  async execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('Voer de actie in die u wilt uitvoeren');

    switch (args[0]) {
      case 'start':
        message.channel.send(`CronJob starten...`);
        return client.job.start();

      case 'stop':
        message.channel.send(`CronJob stoppen...`);
        return client.job.stop();

      case 'status':
        return message.channel.send(`CronJob wordt uitgevoerd: ${client.job.running}.`);

      case 'last':
        return message.channel.send(`CronJob laatste uitvoering: ${client.job.lastDate()}`);

      case 'next':
        return message.channel.send(`CronJob volgende uitvoering: ${client.job.nextDate()}`);

      case 'channel':
        if (!args[1]) return message.reply('Voer het ID van het kanaal in waar u de succes berichten wilt laten zien.');

        // Change the examChannel in the config file and bot
        const newChannel = args[1];
        configFile.examChannel = newChannel;
        client.config.examChannel = newChannel;

        // Write changes to the config file
        fs.writeFile(filePath, JSON.stringify(configFile, null, 2), function (err) {
          if (err) return console.log(err);
        });
        return;

      default:
        return message.reply('Voer een geldige actie in. Geldige acties zijn: start, stop, status, last, next, channel of timer')
    }
  }
}