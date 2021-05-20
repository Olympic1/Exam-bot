const profileModel = require('../../models/profileModel');

module.exports = {
  name: 'examen',
  aliases: ['exam', 'ex'],
  cooldown: 0,
  permissions: [],
  info: {
    description: 'Voegt een examen toe en wenst u succes op de dag van je examen.',
    usage: 'examen <datum> <examens>',
    examples: ['examen 12/5 Biologie', 'exam 19-5 Frans', 'ex 17/5 Wiskunde en Nederlands'],
  },
  async execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de datum en het examen in.');
    if (!client.utils.isValidDate(args[0])) return message.reply('ongeldige datum ingevoerd.');
    if (!args[1]) return message.reply('voer uw examen(s) in.');

    // Convert date into an ISO format
    const dateISO = client.utils.convertToISO(args[0]);

    // Add the date and exams
    try {
      await profileModel.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $push: {
            exams: {
              date: dateISO,
              exam: args.slice(1).join(' '),
            },
          },
        },
      );
    } catch (error) {
      client.log.error(`Er is een fout opgetreden bij het toevoegen van een examen aan de database.\n${error}`);
      return message.channel.send('Er is een fout opgetreden bij het toevoegen van een examen aan de database.');
    }

    return message.reply('jouw examen(s) zijn succesvol toegevoegd. Veel succes met studeren!');
  },
};