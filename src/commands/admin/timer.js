const fs = require('fs');
const validator = require('cron-validate');
const config = require('../../../config.json');

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
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer het tijdschema in wanneer u wilt dat de berichten worden verzonden.');
    if (config.cronTimer === args[0]) return message.reply('dat tijdschema gebruik ik nu al.');

    // Setup validation
    const newTimer = args.join(' ');
    const cronResult = validator(newTimer, {
      preset: 'npm-node-cron',
      override: {
        useSeconds: false,
      },
    });

    // Validate the new timing
    if (!cronResult.isValid()) {
      const errors = cronResult.getError();

      const tmp = [];
      errors.forEach((error) => {
        tmp.push(error);
      });

      return message.reply(`ongeldige timing ingevoerd.\n${tmp.join('\n')}`);
    }

    // Change the cronTimer in the config file and bot
    config.cronTimer = newTimer;

    // Write changes to the config file
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), function(error) {
      if (error) {
        client.log.error(`Er is een fout opgetreden bij het bewerken van het tijdschema in het configuratiebestand.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het configuratiebestand.');
      }

      client.log.info(`Tijdschema succesvol veranderd naar \`${newTimer}\`.`);
    });

    return message.channel.send(`Het tijdschema is succesvol veranderd naar \`${newTimer}\`.`);
  },
};