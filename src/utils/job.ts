import { CronJob } from 'cron';
import { Collection, Util } from 'discord.js';
import { DateTime } from 'luxon';
import { IGuild } from '../models/guildModel';
import { profileModel } from '../models/profileModel';
import { BotClient } from '../structures/BotClient';

/** Creates a new CronJob */
export function createCronJob(client: BotClient<true>, data: IGuild): CronJob {
  return new CronJob(data.cronTimer, async function() {
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
    if (!users.length) return;

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
    if (!mentions) return;

    const guild = client.guilds.cache.get(data._id);
    const channel = guild?.channels.cache.get(data.examChannel);
    const guildOwner = await guild?.fetchOwner();

    // Check if the guild has a channel set
    if (channel?.isText()) {
      const canViewChannel = channel.permissionsFor(client.user)?.has('VIEW_CHANNEL');
      const canSendMessages = channel.permissionsFor(client.user)?.has('SEND_MESSAGES');

      // Check if we can send messages to the channel
      if (canViewChannel && canSendMessages) {
        const msg = Util.splitMessage(`Goeiemorgen, wij wensen de volgende personen veel succes met hun examen(s) vandaag.\n${mentions}`, { char: ', ' });
        msg.forEach(m => channel.send({ content: m }));
        return;
      }

      // No permissions to send messages in channel
      return guildOwner?.send(`Ik heb geprobeerd een bericht te sturen in ${channel.toString()}, maar ik heb geen permissies om dit te doen. Gelieve mij de permissies 'VIEW_CHANNEL' en 'SEND_MESSAGES' te geven of mij een nieuw kanaal toe te wijzen waar ik deze permissies heb.`);
    }

    // No channel set to send messages
    return guildOwner?.send(`Ik heb geprobeerd een bericht te sturen in \`${guild?.name}\`, maar ik ben nog geen kanaal toegewezen. Gelieve het commando \`${data.prefix}kanaal\` uit te voeren om mij een kanaal toe te wijzen.`);
  }, null, true, 'Europe/Brussels');
}