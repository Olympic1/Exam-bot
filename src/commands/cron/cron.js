const cronJob = require('./job');

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

    if (args[0] === 'status') {
      return message.channel.send(`CronJob wordt uitgevoerd: ${cronJob.running}.`);
    }

    if (args[0] === 'stop') {
      message.channel.send(`CronJob stoppen...`);
      cronJob.stop();
      return;
    }

    if (args[0] === 'start') {
      message.channel.send(`CronJob starten...`);
      cronJob.start();
      return;
    }

    if (args[0] === 'last') {
      return message.channel.send(`CronJob laatste uitvoering: ${cronJob.lastDate()}`);
    }

    if (args[0] === 'next') {
      return message.channel.send(`CronJob volgende uitvoering: ${cronJob.nextDate()}`);
    }
  }
}