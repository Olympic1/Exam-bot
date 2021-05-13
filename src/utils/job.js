const cron = require('cron');
const { DateTime } = require('luxon');
const profileModel = require('../models/profileModel');

const job = (client) => new cron.CronJob(client.config.cronTimer, async function() {
  const date = new Date(DateTime.now().startOf('day').setZone('utc', { keepLocalTime: true }).toISO());

  // Search all users who have exams today
  const profile = await profileModel.find(
    {
      'exams.date': {
        '$eq': date,
      },
    },
  );

  // Message all users
  if (profile.length) {
    const allUsers = [];

    profile.forEach((user) => {
      // Find all users who have exams today
      user.exams.forEach((exam) => {
        if (exam.date.toString() === date.toString()) allUsers.push(user.userID);
      });
    });

    // Construct message
    let userList;
    if (allUsers.length > 1) {
      const tmp = allUsers.slice(0, -1).join('>, <@') + '> en <@' + allUsers.slice(-1);
      userList = `<@${tmp}>`;
    } else {
      userList = `<@${allUsers}>`;
    }

    const msg = `Goeiemorgen, wij wensen de volgende personen veel succes met hun examen(s) vandaag.\n${userList} `;
    const channel = client.channels.cache.get(client.config.examChannel);
    channel.send(msg);
  }
}, null, true, 'Europe/Brussels');

module.exports = job;