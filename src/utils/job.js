const cron = require('cron');
const profileModel = require('../models/profileModel');

const job = (client) => new cron.CronJob(client.config.cronTimer, async function () {
  let profile = await profileModel.find(
    {
      "exams.date": {
        "$eq": new Date("2021-05-15")
      }
    }
  );

  if (profile) {
    profile.forEach((user) => {
      const tmp = [];
      user.exams.forEach((exam) => {
        tmp.push(exam.exam);
      });

      const allExams = tmp.slice(0, -1).join(', ') + ' en ' + tmp.slice(-1);

      const msg = `Goeiemorgen <@${user.userID}>, wij wensen je veel succes met je examen ${allExams} vandaag.`;
      const channel = client.channels.cache.get(client.config.examChannel);
      channel.send(msg);
    });
  }
}, null, true, 'Europe/Brussels');

module.exports = job;