import { Collection } from 'discord.js';
import { DateTime } from 'luxon';
import { guildModel } from '../../models/guildModel';
import { profileModel } from '../../models/profileModel';
import { ICommand } from '../../structures/ICommand';

export = {
  name: 'success',
  aliases: ['succes'],
  description: 'Verstuurt de succes berichten.',
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  maxArgs: 1,
  expectedArgs: ['server ID'],
  examples: ['success'],
  options: [
    {
      name: 'server ID',
      description: 'De server ID waarvan ik de berichten moet tonen',
      type: 'STRING',
      required: false
    }
  ],

  async execute(client, message, args) {
    const guildId = args[0] ? client.guilds.cache.get(args[0])?.id : message.guild.id;
    const data = await guildModel.findOne({ _id: guildId });

    // Check null
    if (!data) return;

    // Get the current date
    const today = new Date(DateTime.now().startOf('day').setZone('utc', { keepLocalTime: true }).toISO());

    // Find all users that have at least 1 exam today
    const users = await profileModel.find(
      {
        'exams.date': {
          '$eq': today
        }
      }
    );

    // Check if we found any user
    if (!users.length) return ['send', 'Ik heb niemand gevonden die vandaag examens heeft.'];

    const allUsers: Collection<string, string[]> = new Collection();

    // Loop through every user that has an exam today
    for (const user of users) {
      const allExams: string[] = [];

      // Loop through every exam of the user
      for (const exam of user.exams) {
        // Check if the exam is registered in this guild. User can have registered exams in other guilds.
        if (exam.guildId !== data._id) continue;

        // Check if the exam is today. User can have registered past/future exams.
        if (exam.date.toString() !== today.toString()) continue;

        // Check if the exam is already in the list. User can have registered duplicate exams.
        if (allExams.includes(exam.name)) continue;

        // Add the exam to the list
        allExams.push(exam.name);
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
} as ICommand