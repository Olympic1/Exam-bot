module.exports = (client, discord) => {
  // Set the bot status
  client.user.setPresence({
    status: 'online',
    activity: {
      name: 'MNM Marathonradio',
      type: 'LISTENING',
    },
  }).catch((error) => {
    console.error(`An error occurred when trying to set the status of the bot after logging in.\n${error}`);
  });

  // Start CronJob
  client.job = require('../../utils/job')(client);

  // Show if the bot is logged in and ready to use
  console.info(`Logged in as ${client.user.tag}!`);
};