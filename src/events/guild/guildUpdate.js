const { Guild } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const BotClient = require('../../structures/BotClient');

/**
 * @param {BotClient} client
 * @param {Guild} oldGuild
 * @param {Guild} newGuild
 */
module.exports = async (client, oldGuild, newGuild) => {
  try {
    if (!oldGuild || !newGuild) return;
    if (!newGuild.available) return;

    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: newGuild.id });

    // Check if the name of the guild was changed
    if (!data || oldGuild.name === newGuild.name) return;

    data.name = newGuild.name;
    data.save();
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het bewerken van een gilde in de database.', error);
  }
};