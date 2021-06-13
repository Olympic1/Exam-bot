const { Guild } = require('discord.js');
const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');

/**
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  try {
    // Delete a database profile when the bot leaves a guild or if the guild gets deleted
    await guildModel.findOneAndDelete({ _id: guild.id });

    // Remove the guild from our cache
    client.guildInfo.delete(guild.id);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het verwijderen van een database profiel voor een server.', error);
  }
};