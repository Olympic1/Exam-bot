module.exports = (client, discord) => {
  // Set the bot status
  client.user.setPresence({
    status: 'online',
    activity: {
      name: 'MNM Marathonradio',
      type: 'LISTENING',
    },
  }).catch((error) => {
    client.log.error(`Er is een fout opgetreden bij het instellen van de status van de bot na het inloggen.\n${error}`);
  });

  // Start CronJob
  client.job = require('../../utils/job')(client);

  // Show if the bot is logged in and ready to use
  client.log.info(`Ingelogd als ${client.user.username}!`);
};