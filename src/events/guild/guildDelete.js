const guildModel = require('../../models/guildModel');

module.exports = async (client, guild) => {
  // Delete a database profile when the bot leaves a guild or if the guild gets deleted
  try {
    await guildModel.findOneAndDelete({ _id: guild.id });

    // Remove the guild from our cache
    client.guildInfo.delete(guild.id);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het verwijderen van een database profiel voor een server.', error);
  }
};