import { profileModel } from '../../models/profileModel';
import { ICommand } from '../../structures/ICommand';
import { convertToISO, isValidDate } from '../../utils/functions';

export = {
  name: 'examen',
  aliases: ['exam', 'ex'],
  description: 'Voegt een examen toe en wenst u succes op de dag van uw examen.',
  slash: 'both',
  minArgs: 2,
  maxArgs: 10,
  expectedArgs: ['datum', 'examens', 'datum2', 'examens2', 'datum3', 'examens3', 'datum4', 'examens4', 'datum5', 'examens5'],
  syntaxError: 'Voer de datum en het examen in.',
  examples: ['examen 11/6 Biologie', 'exam 19-6 Frans', 'ex 17/6 Wiskunde en Nederlands', 'examen 14/6 Chemie 15/6 Aardrijkskunde'],
  options: [
    {
      name: 'datum1',
      description: 'De datum van het examen',
      type: 'STRING',
      required: true
    },
    {
      name: 'examens1',
      description: 'De examens',
      type: 'STRING',
      required: true
    },
    {
      name: 'datum2',
      description: 'De datum van het examen',
      type: 'STRING',
      required: false
    },
    {
      name: 'examens2',
      description: 'De examens',
      type: 'STRING',
      required: false
    },
    {
      name: 'datum3',
      description: 'De datum van het examen',
      type: 'STRING',
      required: false
    },
    {
      name: 'examens3',
      description: 'De examens',
      type: 'STRING',
      required: false
    },
    {
      name: 'datum4',
      description: 'De datum van het examen',
      type: 'STRING',
      required: false
    },
    {
      name: 'examens4',
      description: 'De examens',
      type: 'STRING',
      required: false
    },
    {
      name: 'datum5',
      description: 'De datum van het examen',
      type: 'STRING',
      required: false
    },
    {
      name: 'examens5',
      description: 'De examens',
      type: 'STRING',
      required: false
    }
  ],

  async execute(client, message, args) {
    const data = await profileModel.findOne({ _id: message.member?.user.id });
    const joinArgs = args.join(' ');

    // Check null
    if (!data) return;
    if (!joinArgs) return ['reply', 'Gelieve een datum samen met een examen in te geven. (vb: `2/6 Frans` of `2/6 Frans 3/6 Engels`)'];

    // Check that the first argument is a valid date
    if (!isValidDate(args[0])) return ['reply', 'Ongeldige datum ingevoerd. Gelieve een geldige datum in te voeren. (vb: 2/6 of 2-6)'];

    // Regex searches for a date and exams
    const regex = /(\d+[/-]\d+(?:[/-]\d+)?) (.*?)(?:(?= -ex| \d+[/-])|$)/gm;

    // Check if we found a date with an exam
    if (!joinArgs.match(regex)) return ['reply', 'Geen examen ingevoerd. Voer na elke datum minstens één examen in. (vb: `2/6 Frans` of `2/6 Frans 3/6 Engels`)'];

    // Searches for the format "12/6 exam" or "12/6 multiple exams"
    const matches = joinArgs.matchAll(regex);
    let exams = 0;

    for (const match of matches) {
      if (!match[1] || !match[2]) continue;

      // Convert date into an ISO format
      const dateISO = convertToISO(match[1]);

      if (!dateISO) continue;

      // Add the exams to the database
      try {
        exams++;
        data.exams.push({
          guildId: message.guild.id,
          name: match[2],
          date: new Date(dateISO)
        });

        await data.save();
      } catch (error) {
        client.logger.error('Er is een fout opgetreden bij het toevoegen van een examen aan de database.', error);
        return ['send', 'Er is een fout opgetreden bij het toevoegen van een examen aan de database.'];
      }
    }

    return ['reply', `Jouw examen${exams > 1 ? 's zijn' : ' is'} succesvol toegevoegd. Veel succes met studeren!`];
  }
} as ICommand