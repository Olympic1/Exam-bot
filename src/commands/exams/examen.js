const profileModel = require('../../models/profileModel');

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
    if (!client.utils.isValidDate(args[0])) return message.reply('ongeldige datum ingevoerd. Gelieve een geldige datum in te voeren (vb: 12/6 of 12-6).');
    if (!args[1]) return message.reply('voer uw examen(s) in.');

    // Join all the arguments into a message, so we can search for the exams per day
    // Searches for the format "12/6 exam" or "12/6 multiple exams"
    const joinArgs = args.join(' ');
    const matches = joinArgs.matchAll(/(\d+[/-]\d+) (.*?)(?:(?= \d)|$)/gm);

    for (const match of matches) {
      // Convert date into an ISO format
      const dateISO = client.utils.convertToISO(match[1]);

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

    return message.reply('jouw examen(s) zijn succesvol toegevoegd. Veel succes met studeren!');
  },
};