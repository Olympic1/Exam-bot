import { Guild } from 'discord.js';
import { guildModel } from '../../models/guildModel';
import { IEvent } from '../../structures/IEvent';
import { createCronJob } from '../../utils/job';

export = {
  name: 'guildCreate',

  async execute(client, guild: Guild) {
    try {
      if (!guild) return;

      // Create a database profile when the bot joins a new guild
      const data = await guildModel.create({ _id: guild.id, name: guild.name });

      // Start cronjob
      const job = createCronJob(client, data);

      // Cache the data
      client.cronJobs.set(guild.id, job);
    } catch (error) {
      client.logger.error('Er is een fout opgetreden bij het toevoegen van een gilde aan de database.', error);
    }
  }
} as IEvent