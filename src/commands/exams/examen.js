const { ICommand } = require('../../typings');
const profileModel = require('../../models/profileModel');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'examen',
  aliases: ['exam', 'ex'],
  cooldown: 0,
  permissions: [],
  info: {
    description: 'Voegt een examen toe en wenst u succes op de dag van uw examen.',
    usage: 'examen <datum> <examens>',
    examples: ['examen 12/6 Biologie', 'exam 19-6 Frans', 'ex 17/6 Wiskunde en Nederlands'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer de datum en het examen in.');
    if (!utils.isValidDate(args[0])) return message.reply('ongeldige datum ingevoerd. Gelieve een geldige datum in te voeren (vb: 12/6 of 12-6).');
    if (!args[1]) return message.reply('voer uw examen(s) in.');

    // Join all the arguments into a message, so we can search for the exams per day
    const joinArgs = args.join(' ');
    const regex = /(\d+[/-]\d+) (.*?)(?:(?= -ex| \d+[/-])|$)/gm;

    // Check if we found a date and an exam
    if (!joinArgs.match(regex)) return message.reply('geen examens ingevoerd. Voer na elke datum minstens één examen in. (vb: `2/6 Frans` of `2/6 Frans 3/6 Engels`)');

    // Searches for the format "12/6 exam" or "12/6 multiple exams"
    const matches = joinArgs.matchAll(regex);
    let exams = 0;

    for (const match of matches) {
      exams++;

      // Convert date into an ISO format
      const dateISO = utils.convertToISO(match[1]);

      // Add the exams to the database
      try {
        await profileModel.findOneAndUpdate(
          {
            _id: message.author.id,
          },
          {
            $push: {
              exams: {
                guildId: message.guild.id,
                name: match[2],
                date: dateISO,
              },
            },
          },
        );
      } catch (error) {
        client.log.error('Er is een fout opgetreden bij het toevoegen van een examen aan de database.', error);
        return message.channel.send('Er is een fout opgetreden bij het toevoegen van een examen aan de database.');
      }
    }

    return message.reply(`Jouw examen${exams > 1 ? 's zijn' : ' is'} succesvol toegevoegd. Veel succes met studeren!`);
  },
};