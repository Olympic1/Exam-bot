const { default: validate } = require('cron-validate');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const { ICommand } = require('../../structures/ICommand');
const { updateCronjob } = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'timer',
  description: 'Verander het tijdschema wanneer de bot de succes-berichten stuurt.',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  minArgs: 5,
  maxArgs: 6,
  expectedArgs: ['minuut', 'uur', 'dag', 'maand', 'dag van de week', 'seconde'],
  syntaxError: 'Voer het tijdschema in wanneer je wilt dat de berichten worden verzonden.',
  examples: ['timer 0 8 * * *', 'timer 30 6 * * *'],
  options: [
    {
      name: 'minuut',
      description: 'De minuten',
      type: 'STRING',
      required: true,
    },
    {
      name: 'uur',
      description: 'De uren',
      type: 'STRING',
      required: true,
    },
    {
      name: 'dag',
      description: 'De dagen',
      type: 'STRING',
      required: true,
    },
    {
      name: 'maand',
      description: 'De maanden',
      type: 'STRING',
      required: true,
    },
    {
      name: 'dag van de week',
      description: 'De dag van de week',
      type: 'STRING',
      required: true,
    },
    {
      name: 'seconde',
      description: 'De seconden',
      type: 'STRING',
      required: false,
    },
  ],

  async execute(client, message, args) {
    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: message.guild.id });

    // Move the last optional argument to the first element
    // @ts-ignore
    if (args.length === 6) args.unshift(args.pop());

    const newTimer = args.join(' ');

    // Check null
    if (!data) return;
    if (!newTimer) return ['reply', 'Gelieve een nieuw tijdschema in te geven.'];

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
      /** @type {string[]} */
      const tmp = [];
      for (const error of errors) {
        tmp.push(error);
      }

      return ['reply', `Ongeldige timing ingevoerd.\n${tmp.join('\n')}`];
    }

    try {
      // Change cronTimer in the database
      data.cronTimer = newTimer;
      await data.save();

      // Start a new cronjob
      updateCronjob(client, message.guild.id, data);

      return ['send', `Het tijdschema is succesvol veranderd naar \`${newTimer}\`.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van een tijdschema in de database.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van een tijdschema in de database.'];
    }
  },
};