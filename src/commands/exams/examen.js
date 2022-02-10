const { ICommand } = require('../../typings');
const profileModel = require('../../models/profileModel');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'examen',
  aliases: ['exam', 'ex'],
  description: 'Voegt een examen toe en wenst u succes op de dag van uw examen.',
  cooldown: 0,
  permissions: [],
  slash: 'both',
  info: {
    minArgs: 2,
    maxArgs: 25,
    expectedArgs: '<datum> <examens>',
    syntaxError: 'Voer de datum en het examen in.',
    examples: ['examen 11/6 Biologie', 'exam 19-6 Frans', 'ex 17/6 Wiskunde en Nederlands', 'examen 14/6 Chemie 15/6 Aardrijkskunde'],
  },
  async execute(message, args, client) {
    // Check that the first argument is a valid date
    if (!utils.isValidDate(args[0])) return ['reply', 'Ongeldige datum ingevoerd. Gelieve een geldige datum in te voeren. (vb: 2/6 of 2-6)'];

    // Join all the arguments into a message, so we can search for the exams per day
    const joinArgs = args.join(' ');
    const regex = /(\d+[/-]\d+) (.*?)(?:(?= -ex| \d+[/-])|$)/gm;

    // Check if we found a date with an exam
    if (!joinArgs.match(regex)) return ['reply', 'Geen examens ingevoerd. Voer na elke datum minstens één examen in. (vb: `2/6 Frans` of `2/6 Frans 3/6 Engels`)'];

    // Searches for the format "12/6 exam" or "12/6 multiple exams"
    const matches = joinArgs.matchAll(regex);
    let exams = 0;

    for (const match of matches) {
      exams++;

      // Convert date into an ISO format
      const dateISO = utils.convertToISO(match[1]);

      if (!dateISO) continue;

      // Add the exams to the database
      try {
        await profileModel.findOneAndUpdate(
          {
            _id: message.member.user.id,
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
        return ['send', 'Er is een fout opgetreden bij het toevoegen van een examen aan de database.'];
      }
    }

    return ['reply', `Jouw examen${exams > 1 ? 's zijn' : ' is'} succesvol toegevoegd. Veel succes met studeren!`];
  },
};