const profileModel = require('../../models/profileModel');

module.exports = async (client, discord, guildMember) => {
  // Remove the database profile when a user leaves the server
  try {
    await profileModel.findOneAndDelete(guildMember.id);
  } catch (error) {
    console.error(`Er is een fout opgetreden bij het verwijderen van een databaseprofiel.\n${error}`);
  }
};