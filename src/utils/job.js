const { CronJob } = require('cron');
const { Collection } = require('discord.js');
const { DateTime } = require('luxon');
const { BotClient, IGuild } = require('../typings');
const profileModel = require('../models/profileModel');

/**
 * @param {BotClient} client
 * @param {IGuild} data
 */
module.exports = (client, data) => {
  return new CronJob(data.cronTimer, async function() {
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
      if (!mentions) return;

      const guild = client.guilds.cache.get(data._id);
      const channel = guild.channels.cache.get(data.examChannel);
      const guildOwner = await guild.fetchOwner();

      // Check if the guild has a channel set
      if (channel) {
        const canViewChannel = channel.permissionsFor(client.user.id).has('VIEW_CHANNEL');
        const canSendMessages = channel.permissionsFor(client.user.id).has('SEND_MESSAGES');

        // Check if we can send messages to the channel
        // @ts-ignore
        if (canViewChannel && canSendMessages) return channel.send(`Goeiemorgen, wij wensen de volgende personen veel succes met hun examen(s) vandaag.\n${mentions}`, { split: true });

        return guildOwner.send(`Ik heb geprobeerd een bericht te sturen in ${channel.toString()}, maar ik heb geen permissies om dit te doen. Gelieve mij de vereiste permissies te geven of mij een nieuw kanaal toe te wijzen.`);
      }

      return guildOwner.send(`Ik heb geprobeerd een bericht te sturen in \`${guild.name}\`, maar ik heb nog geen kanaal toegewezen gekregen. Gelieve het commando \`${data.prefix}kanaal\` uit te voeren om mij een kanaal toe te wijzen.`);
    }
  }, null, true, 'Europe/Brussels');
};