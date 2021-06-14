const { Guild } = require('discord.js');
const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/**
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  try {
    // Create a database profile when the bot joins a new guild
    const data = await guildModel.create({ _id: guild.id });

    // Start cronjob and cache the guild data
    utils.updateCronjob(client, guild.id, data);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het aanmaken van een database profiel voor een nieuwe server.', error);
  }
};