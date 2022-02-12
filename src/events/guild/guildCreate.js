const { Guild } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const BotClient = require('../../structures/BotClient');
const { createCronJob } = require('../../utils/job');

/**
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  try {
    if (!guild) return;

    // Create a database profile when the bot joins a new guild
    /** @type {GuildDoc} */
    const data = await guildModel.create({ _id: guild.id });

    // Start cronjob
    const job = createCronJob(client, data);

    // Cache the data
    client.cronJobs.set(guild.id, job);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het toevoegen van een gilde aan de database.', error);
  }
};