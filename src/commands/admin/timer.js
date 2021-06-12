const { default: validate } = require('cron-validate');
const { ICommand } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'timer',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander het tijdschema wanneer de bot de succes-berichten stuurt.',
    usage: 'timer <timing>',
    examples: ['timer 0 8 * * *', 'timer 30 6 * * *'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer het tijdschema in wanneer u wilt dat de berichten worden verzonden.');

    let data = client.guildInfo.get(message.guild.id);
    const newTimer = args.join(' ');

    if (data.cronTimer === newTimer) return message.reply('dat tijdschema gebruik ik nu al.');

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

      const tmp = [];
      for (const error of errors) {
        tmp.push(error);
      }

      return message.reply(`ongeldige timing ingevoerd.\n${tmp.join('\n')}`);
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

      return message.channel.send(`Het tijdschema is succesvol veranderd naar \`${newTimer}\`.`);
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van het tijdschema.', error);
      return message.channel.send('Er is een fout opgetreden bij het bewerken van het tijdschema.');
    }
  },
};