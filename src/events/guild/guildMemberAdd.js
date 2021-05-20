const profileModel = require('../../models/profileModel');

module.exports = async (client, discord, guildMember) => {
  // If user is a bot, don't create a profile
  if (guildMember.bot) return;

  // Create a database profile when a user joins the server
  try {
    const profile = await profileModel.create({
      userID: guildMember.id,
      serverID: guildMember.guild.id,
      cooldowns: [],
      exams: [],
    });

    profile.save();
  } catch (error) {
    client.log.error(`Er is een fout opgetreden bij het aanmaken van een databaseprofiel voor een nieuwe gebruiker.\n${error}`);
  }
};