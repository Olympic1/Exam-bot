const { default: validate } = require('cron-validate');
const { ICommand } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'timer',
  aliases: [],
  description: 'Verander het tijdschema wanneer de bot de succes-berichten stuurt.',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  info: {
    minArgs: 5,
    maxArgs: 6,
    expectedArgs: '<timing>',
    syntaxError: 'Voer het tijdschema in wanneer je wilt dat de berichten worden verzonden.',
    examples: ['timer 0 8 * * *', 'timer 30 6 * * *'],
  },
  async execute(message, args, client) {
    let data = client.guildInfo.get(message.guild.id);
    const newTimer = args.join(' ');

    // Check if the provided timing is already used for the bot
    if (data.cronTimer === newTimer) return ['reply', 'Dat tijdschema gebruik ik nu al.'];

    // Setup validation
    const cronResult = validate(newTimer, {
      preset: 'npm-node-cron',
      override: {
        useSeconds: args.length === 6,
      },
    });

    // Validate the new timing
    if (!cronResult.isValid()) {
      const errors = cronResult.getError();

      // Return possible errors
      const tmp = [];
      for (const error of errors) {
        tmp.push(error);
      }

      return ['reply', `Ongeldige timing ingevoerd.\n${tmp.join('\n')}`];
    }

    try {
      // Change cronTimer in the database
      data = await guildModel.findOneAndUpdate(
        {
          _id: message.guild.id,
        },
        {
          cronTimer: newTimer,
        },
        {
          new: true,
        },
      );

      // Start cronjob and cache the guild data
      utils.updateCronjob(client, message.guild.id, data);

      return ['send', `Het tijdschema is succesvol veranderd naar \`${newTimer}\`.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van het tijdschema.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van het tijdschema.'];
    }
  },
};