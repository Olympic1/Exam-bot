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
      const allExams = [];
      user.exams.forEach((exam) => {
        if (exam.date.toString() === new Date(date).toString()) allExams.push(exam.exam);
      });

      // Remove any duplicates.
      const exams = allExams.filter((dub, index) => {
        return allExams.indexOf(dub) === index;
      });

      let successString;
      if (exams.length > 1) {
        const tmp = exams.slice(0, -1).join(', ') + ' en ' + exams.slice(-1);
        successString = `examens ${tmp}`;
      } else {
        successString = `examen ${exams}`;
      }

      const msg = `Goeiemorgen <@${user.userID}>, wij wensen je veel succes met je ${successString} vandaag.`;
      const channel = client.channels.cache.get(client.config.examChannel);
      channel.send(msg);
    });
  }
}, null, true, 'Europe/Brussels');

module.exports = job;