module.exports = {
  name: 'cron',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Voer allerlei acties uit met betrekking tot CronJob.',
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
        const status = client.job.running ? 'Ja' : 'Nee';
        return message.channel.send(`CronJob wordt uitgevoerd: ${status}.`);

      case 'last':
        return message.channel.send(`CronJob laatste uitvoering: ${client.job.lastDate()}`);

      case 'next':
        return message.channel.send(`CronJob volgende uitvoering: ${client.job.nextDate()}`);

      default:
        return message.reply('Voer een geldige actie in. Geldige acties zijn: start, stop, status, last, next')
    }
  }
}