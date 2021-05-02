const profileModel = require('../../models/profileModel');

module.exports = async (client, discord, guildMember) => {
  // Create a database profile when a user joins the server
  try {
    const profile = await profileModel.create({
      userID: guildMember.id,
      serverID: guildMember.guild.id,
      cooldowns: [],
      exams: []
    });

    await profile.save();
  } catch (error) {
    console.error(`An error occurred when trying to create a database profile.\n${error}`);
  }
}