const profileModel = require('../../models/profileModel');

module.exports = async (client, discord, guildMember) => {
  // Remove the database profile when a user leaves the server
  try {
    await profileModel.findOneAndDelete(guildMember.id);
  } catch (error) {
    console.error(`An error occurred when trying to delete a database profile.\n${error}`);
  }
};