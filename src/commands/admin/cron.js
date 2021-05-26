module.exports = {
  name: 'cron',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Voer allerlei acties uit met betrekking tot cronjob (tijdschema).',
    usage: 'cron <actie>',
    examples: ['cron start', 'cron stop', 'cron status', 'cron laatste', 'cron volgende'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer de actie in die u wilt uitvoeren. Acties: start, stop, status, laatste, volgende.');

    const job = client.guildInfo.get(message.guild.id).job;
    const isRunning = job.running;

    switch (args[0]) {
      case 'start':
        // Check if cronjob is already running to prevent multiple instances
        if (isRunning) return message.channel.send('Cronjob is al gestart.');

        message.channel.send('Cronjob starten...');
        return job.start();

      case 'stop':
        // Check if cronjob is already stopped to prevent unnecessary actions
        if (!isRunning) return message.channel.send('Cronjob is al gestopt.');

        message.channel.send('Cronjob stoppen...');
        return job.stop();

      case 'status':
        return message.channel.send(`Cronjob wordt uitgevoerd: ${isRunning ? 'Ja' : 'Nee'}.`);

      case 'last':
      case 'laatste':
        // Check if cronjob is already running to get the last execution date
        if (!isRunning) return message.channel.send('Start eerst cronjob.');
        if (job.lastDate() === undefined) return message.channel.send('Kan de laatste uitvoering niet vinden.');

        return message.channel.send(`Cronjob werd laatst uitgevoerd op: ${client.utils.formatToDate(Date.parse(job.lastDate()))}`);

      case 'next':
      case 'volgende':
        // Check if cronjob is already running to get the next execution date
        if (!isRunning) return message.channel.send('Start eerst cronjob.');
        if (job.nextDate() === undefined) return message.channel.send('Kan de volgende uitvoering niet vinden.');

        return message.channel.send(`Cronjob wordt uitgevoerd op: ${client.utils.formatToDate(Date.parse(job.nextDate()))}`);

      default:
        return message.reply('voer een geldige actie in. Geldige acties zijn: start, stop, status, laatste, volgende.');
    }
  },
};