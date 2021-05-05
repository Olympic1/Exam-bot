const fs = require('fs');
const filePath = '../../../config.json';
const configFile = require(filePath);
const validator = require('cron-validate');

module.exports = {
  name: 'timer',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander de timing wanneer de bot de succes-berichten stuurt.',
    usage: 'timer <nieuwe timing>',
    examples: ['timer 0 8 * * *', 'timer 30 6 * * *'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de timing in dat u wilt instellen.');
    if (client.config.cronTimer === args[0]) return message.reply('die timing gebruik ik nu al.');

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
    configFile.cronTimer = newTimer;
    client.config.cronTimer = newTimer;

    // Write changes to the config file
    fs.writeFile(filePath, JSON.stringify(configFile, null, 2), function(error) {
      if (error) {
        console.error(`An error occurred when trying to write the timer to the config file.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het config bestand.');
      }

      console.info(`Timer successfully changed to \`${newTimer}\`.`);
    });

    return message.channel.send(`De timing is succesvol veranderd naar \`${newTimer}\`.`);
  },
};