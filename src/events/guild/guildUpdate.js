const { Guild } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const { IEvent } = require('../../structures/IEvent');

/** @type {IEvent} */
module.exports = {
  name: 'guildUpdate',

  /**
   * @param {Guild} oldGuild
   * @param {Guild} newGuild
   */
  async execute(client, oldGuild, newGuild) {
    try {
      if (!oldGuild || !newGuild) return;
      if (!newGuild.available) return;

      /** @type {GuildDoc} */
      const data = await guildModel.findOne({ _id: newGuild.id });

      // Check if the name of the guild was changed
      if (!data || oldGuild.name === newGuild.name) return;

      data.name = newGuild.name;
      await data.save();
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van een gilde in de database.', error);
    }
  },
};