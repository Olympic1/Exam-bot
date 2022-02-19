import { Guild } from 'discord.js';
import { guildModel } from '../../models/guildModel';
import { IEvent } from '../../structures/IEvent';

export = {
  name: 'guildUpdate',

  async execute(client, oldGuild: Guild, newGuild: Guild) {
    try {
      if (!oldGuild || !newGuild) return;
      if (!newGuild.available) return;

      const data = await guildModel.findOne({ _id: newGuild.id });

      // Check if the name of the guild was changed
      if (!data || oldGuild.name === newGuild.name) return;

      data.name = newGuild.name;
      await data.save();
    } catch (error) {
      client.logger.error('Er is een fout opgetreden bij het bewerken van een gilde in de database.', error);
    }
  }
} as IEvent