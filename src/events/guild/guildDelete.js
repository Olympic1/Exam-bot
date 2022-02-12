const { Guild } = require('discord.js');
const { guildModel } = require('../../models/guildModel');
const { profileModel } = require('../../models/profileModel');
const BotClient = require('../../structures/BotClient');

/**
 * @param {BotClient} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  try {
    if (!guild) return;

    // Delete a database profile when the bot leaves a guild or if the guild gets deleted
    await guildModel.findOneAndDelete({ _id: guild.id });

    // Delete all the references to the guild in user.cooldowns
    await profileModel.updateMany(
      { },
      { $pull: { cooldowns: { guildId: guild.id } } },
    );

    // Delete all the references to the guild in user.exams
    await profileModel.updateMany(
      { },
      { $pull: { exams: { guildId: guild.id } } },
    );

    // Delete the cronjob that runs in this guild
    client.cronJobs.delete(guild.id);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het verwijderen van een gilde uit de database.', error);
  }
};