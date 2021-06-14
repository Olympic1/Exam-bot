const { ICommand } = require('../../typings');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'cron',
  aliases: [],
  description: 'Voer allerlei acties uit met betrekking tot cronjob (tijdschema).',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  info: {
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<actie>',
    syntaxError: 'Voer de actie in die je wilt uitvoeren. Acties: `start`, `stop`, `status`, `laatste`, `volgende`.',
    examples: ['cron start', 'cron stop', 'cron status', 'cron laatste', 'cron volgende'],
  },
  async execute(message, args, client) {
    const job = client.guildInfo.get(message.guild.id).job;
    const isRunning = job.running;

    switch (args[0]) {
      case 'start':
        // Check if cronjob is already running to prevent multiple instances
        if (isRunning) return ['send', 'Cronjob is al gestart.'];

        job.start();

        // Safety check
        if (job.running) return ['send', 'Cronjob is gestart.'];

        return ['send', `Er is iets foutgelopen. Neem contact op met <@${client.application.owner.id}>.`];

      case 'stop':
        // Check if cronjob is already stopped to prevent unnecessary actions
        if (!isRunning) return ['send', 'Cronjob is al gestopt.'];

        job.stop();

        // Safety check
        if (!job.running) return ['send', 'Cronjob is gestopt.'];

        return ['send', `Er is iets foutgelopen. Neem contact op met <@${client.application.owner.id}>.`];

      case 'status':
        return ['send', `Cronjob wordt uitgevoerd: ${isRunning ? 'Ja' : 'Nee'}.`];

      case 'last':
      case 'laatste':
        // Check if cronjob is already running to get the last execution date
        if (!isRunning) return ['send', 'Start eerst cronjob.'];
        if (job.lastDate() === undefined) return ['send', 'Kan de laatste uitvoering niet vinden.'];

        return ['send', `Cronjob werd laatst uitgevoerd op: ${utils.formatToDate(Date.parse(job.lastDate().toString()))}`];

      case 'next':
      case 'volgende':
        // Check if cronjob is already running to get the next execution date
        if (!isRunning) return ['send', 'Start eerst cronjob.'];
        if (job.nextDate() === undefined) return ['send', 'Kan de volgende uitvoering niet vinden.'];

        return ['send', `Cronjob zal worden uitgevoerd op: ${utils.formatToDate(Date.parse(job.nextDate().toString()))}`];

      default:
        // Not a valid action provided
        return ['reply', 'Voer een geldige actie in. Geldige acties zijn: start, stop, status, laatste, volgende.'];
    }
  },
};