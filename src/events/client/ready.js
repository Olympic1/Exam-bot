const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @param {BotClient} client */
module.exports = async (client) => {
  // Show that the bot is logged in and ready to use
  client.log.info(`Ingelogd als ${client.user.username}.`);

  // Set the bot's status
  const status = process.env.NODE_ENV !== 'production' ? 'Testing' : 'Marathonradio';
  const type = process.env.NODE_ENV !== 'production' ? 'PLAYING' : 'LISTENING';

  utils.setBotStatus(client, status, type);

  // Get all the guilds from our database and cache it, so we don't have to query it each time
  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    // Search the guild in our database. If we didn't find the guild, create a profile for it.
    const data = await guildModel.findOne({ _id: guildId }) ?? await guildModel.create({ _id: guildId });

    // Start cronjob
    data.job = require('../../utils/job')(client, data);

    // Cache the data
    client.guildInfo.set(guildId, data);
  }

  client.log.info(`Cached ${client.guildInfo.size} guilds.`);
};