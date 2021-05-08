module.exports = {
  name: 'cron',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Voer allerlei acties uit met betrekking tot CronJob (tijdschema).',
    usage: 'cron <actie>',
    examples: ['cron start', 'cron stop', 'cron status', 'cron laatste', 'cron volgende'],
  },
  async execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de actie in die u wilt uitvoeren. Acties: start, stop, status, laatste, volgende');

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
        return message.channel.send(`CronJob wordt uitgevoerd: ${running ? 'Ja' : 'Nee'}.`);

      case 'last':
      case 'laatste':
        if (!running) return message.channel.send('Start eerst CronJob.');
        if (client.job.lastDate() === undefined) return message.channel.send('Kan de laatste uitvoering niet vinden.');

        return message.channel.send(`CronJob laatst uitgevoerd: ${client.job.lastDate()}`);

      case 'next':
      case 'volgende':
        if (!running) return message.channel.send('Start eerst CronJob.');
        if (client.job.nextDate() === undefined) return message.channel.send('Kan de volgende uitvoering niet vinden.');

        return message.channel.send(`CronJob's volgende uitvoering: ${client.job.nextDate()}`);

      default:
        return message.reply('voer een geldige actie in. Geldige acties zijn: start, stop, status, laatste, volgende');
    }
  },
};