const { Collection } = require('discord.js');
const { DateTime } = require('luxon');
const { ICommand } = require('../../typings');
const profileModel = require('../../models/profileModel');

/** @type {ICommand} */
module.exports = {
  name: 'success',
  aliases: ['succes'],
  description: 'Verstuurt de succes berichten.',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  info: {
    maxArgs: 1,
    expectedArgs: '[server ID]',
    examples: ['success'],
  },
  async execute(message, args, client) {
    // @ts-ignore
    const guildId = args.length ? client.guilds.cache.get(args[0]).id : message.guild.id;
    const data = client.guildInfo.get(guildId);

    // Get the current date
    const date = new Date(DateTime.now().startOf('day').setZone('utc', { keepLocalTime: true }).toISO());

    // Find all users that have at least 1 exam today
    const profiles = await profileModel.find(
      {
        'exams.date': {
          '$eq': date,
        },
      },
    );

    // Check if we found any user(s)
    if (profiles.length) {
      const allUsers = new Collection();

      for (const user of profiles) {
        const allExams = [];

        for (const exam of user.exams) {
          // Check if the exam is registered in this guild. User can have registered exams in other guilds.
          const examInGuild = exam.guildId === data._id;

          // Check if the exam is today. User can have registered future exams.
          const examIsToday = exam.date.toString() === date.toString();

          // Check if the exam is already in the list. User can have registered duplicate exams.
          const examInArray = allExams.includes(exam.name);

          // If all checks pass, add the exam to the list
          if (examInGuild && examIsToday && !examInArray) allExams.push(exam.name);
        }

        // Check if we have at least 1 exam in the list
        if (allExams.length > 0) allUsers.set(user._id, allExams);
      }

      // Construct mentions
      let mentions = '';
      if (allUsers) {
        for (const [id, exam] of allUsers.entries()) {
          const str = `<@${id}> (${exam.join(', ')})`;

          if (id === allUsers.firstKey()) {
            mentions = `${str}`;
          } else if (id === allUsers.lastKey()) {
            mentions += ` en ${str}`;
          } else {
            mentions += `, ${str}`;
          }
        }
      }

      // Check if we have a mention
      if (!mentions) return ['send', 'Ik heb niemand gevonden die vandaag examens heeft.'];

      return ['send', `Goeiemorgen, wij wensen de volgende personen veel succes met hun examen(s) vandaag.\n${mentions}`];
    }

    return ['send', 'Ik heb niemand gevonden die vandaag examens heeft.'];
  },
};