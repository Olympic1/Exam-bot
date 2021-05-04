module.exports = {
  name: 'cron',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Voer allerlei acties uit met betrekking tot CronJob.',
    usage: 'cron <actie>',
    examples: ['cron start', 'cron stop', 'cron status', 'cron last', 'cron next']
  },
  async execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de actie in die u wilt uitvoeren');

    const running = client.job.running;

    switch (args[0]) {
      case 'start':
        if (running) return message.channel.send('CronJob is al gestart.');

        message.channel.send('CronJob starten...');
        return client.job.start();

      case 'stop':
        if (!running) return message.channel.send('CronJob is al gestopt.');

        message.channel.send('CronJob stoppen...');
        return client.job.stop();

      case 'status':
        const status = running ? 'Ja' : 'Nee';
        return message.channel.send(`CronJob wordt uitgevoerd: ${status}.`);

      case 'last':
        if (!running) return message.channel.send('Start eerst CronJob.');
        if (client.job.lastDate() === undefined) return message.channel.send('Kan de laatste uitvoering niet vinden.');

        return message.channel.send(`CronJob laatste uitvoering: ${client.job.lastDate()}`);

      case 'next':
        if (!running) return message.channel.send('Start eerst CronJob.');
        if (client.job.nextDate() === undefined) return message.channel.send('Kan de volgende uitvoering niet vinden.');

        return message.channel.send(`CronJob volgende uitvoering: ${client.job.nextDate()}`);

      default:
        return message.reply('voer een geldige actie uit. Geldige acties zijn: start, stop, status, last, next');
    }
  }
}