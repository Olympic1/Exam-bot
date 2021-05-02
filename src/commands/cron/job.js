const cron = require('cron');
const profileModel = require('../../models/profileModel');

// Format of CronJob:
// seconds (optional): 0-59
// minute: 0-59
// hour: 0-23
// day of month: 1-31
// month: 1-12
// day of week: 0-6 (0 = sunday)

// Current setup is every day at 8:00
const job = (client) => new cron.CronJob('*/20 * * * * *', async function () {
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