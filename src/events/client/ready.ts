import { guildModel } from '../../models/guildModel';
import { IEvent } from '../../structures/IEvent';
import { IHandler } from '../../structures/IHandler';
import { setBotStatus } from '../../utils/functions';
import { createCronJob } from '../../utils/job';

export = {
  name: 'ready',
  once: true,

  async execute(client) {
    if (!client.application?.owner) await client.application?.fetch();

    // Register the commands
    const handler: IHandler = await require('../../handlers/commandHandler');
    await handler.execute(client);

    // Are we testing the bot
    const testing = process.env.NODE_ENV !== 'production';

    // Set the bot's status
    const status = testing ? 'Testing' : 'Marathonradio';
    const type = testing ? 'PLAYING' : 'LISTENING';

    setBotStatus(client, status, type);

    // Search for every cached guild in our database. If we didn't find the guild, create a profile for it.
    for (const guild of client.guilds.cache.values()) {
      const data = await guildModel.findOne({ _id: guild.id }) ?? await guildModel.create({ _id: guild.id, name: guild.name });

      // Start cronjob
      const job = createCronJob(client, data);

      // Cache the data
      client.cronJobs.set(guild.id, job);
    }

    // Show that the bot is logged in and ready to use
    client.logger.info(`Bot is online op ${client.guilds.cache.size} servers.`);
  }
} as IEvent