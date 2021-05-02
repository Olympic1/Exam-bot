const cron = require('cron');
const profileModel = require('../../models/profileModel');

module.exports = {
  execute(client, discord) {
    // Format of CronJob:
    // seconds (optional): 0-59
    // minute: 0-59
    // hour: 0-23
    // day of month: 1-31
    // month: 1-12
    // day of week: 0-6 (0 = sunday)

    // Current setup is every day at 8:00
    const job = new cron.CronJob('*/20 * * * * *', async function () {
      let profile = await profileModel.find(
        {
          "exams.date": {
            "$eq": new Date("2021-05-15")
          }
        }
      );

      if (profile) {
        profile.forEach((user) => {
          const msg = `Goeiemorgen <@${user.userID}>, wij wensen je veel succes met je examen ${user.exams[0].exam} vandaag.`;

          const channel = client.channels.cache.get('838084030062264320');
          channel.send(msg);
        });
      }
    }, null, true, 'Europe/Brussels');
    job.start();
  }
}