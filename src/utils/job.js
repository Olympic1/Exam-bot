const cron = require('cron');
const { DateTime } = require('luxon');
const profileModel = require('../models/profileModel');

const job = (client) => new cron.CronJob(client.config.cronTimer, async function() {
  const date = DateTime.now().startOf('day').setZone('utc', { keepLocalTime: true }).toISO();

  const profile = await profileModel.find(
    {
      'exams.date': {
        '$eq': new Date(date),
      },
    },
  );

  if (profile) {
    profile.forEach((user) => {
      const tmp = [];
      user.exams.forEach((exam) => {
        if (exam.date.toString() === new Date(date).toString()) tmp.push(exam.exam);
      });

      let allExams;
      if (tmp.length > 1) {
        const all = tmp.slice(0, -1).join(', ') + ' en ' + tmp.slice(-1);
        allExams = `examens ${all}`;
      } else {
        allExams = `examen ${tmp}`;
      }

      const msg = `Goeiemorgen <@${user.userID}>, wij wensen je veel succes met je ${allExams} vandaag.`;
      const channel = client.channels.cache.get(client.config.examChannel);
      channel.send(msg);
    });
  }
}, null, true, 'Europe/Brussels');

module.exports = job;