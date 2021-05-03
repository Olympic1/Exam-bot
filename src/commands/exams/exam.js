const profileModel = require('../../models/profileModel');

module.exports = {
  name: 'exam',
  aliases: ['examen', 'ex'],
  cooldown: 0,
  permissions: [],
  info: {
    description: 'Voegt een examen toe aan uw naam en wenst u succes op de dag van je examen.',
    usage: 'exam <datum> <examens>',
    examples: ['exam 12/5 Biologie', 'examen 19-5 Frans', 'ex 17/5 Wiskunde']
  },
  async execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('Voer de datum en het examen(s) in.');
    if (!client.utils.isValidDate(args[0])) return message.reply('Ongeldige datum ingevoerd.')
    if (!args[1]) return message.reply('Voer uw examen(s) in.')

    // Convert date into an ISO format
    const dateISO = client.utils.convertToISO(args[0]);

    try {
      await profileModel.findOneAndUpdate(
        {
          userID: message.author.id
        },
        {
          $push: {
            exams: {
              date: dateISO,
              exam: args.slice(1).join(' ')
            }
          }
        }
      );
    } catch (error) {
      console.error(`An error occurred when trying to add an exam into the database.\n${error}`);
      return message.channel.send('Er is een fout opgetreden bij het toevoegen van een examen in de database.');
    }
  }
}