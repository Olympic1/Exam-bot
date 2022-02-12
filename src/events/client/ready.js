const { GuildDoc, guildModel } = require('../../models/guildModel');
const { IEvent } = require('../../structures/IEvent');
const { setBotStatus } = require('../../utils/functions');
const { createCronJob } = require('../../utils/job');

/** @type {IEvent} */
module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    if (!client.application?.owner) await client.application?.fetch();

    // Are we testing the bot
    const testing = process.env.NODE_ENV !== 'production';

    // Show that the bot is logged in and ready to use
    client.log.info(`Bot is online op ${client.guilds.cache.size} servers.`);

    // Set the bot's status
    const status = testing ? 'Testing' : 'Marathonradio';
    const type = testing ? 'PLAYING' : 'LISTENING';

    setBotStatus(client, status, type);

    // Search for every cached guild in our database. If we didn't find the guild, create a profile for it.
    for (const guild of client.guilds.cache.values()) {
      /** @type {GuildDoc} */
      const data = await guildModel.findOne({ _id: guild.id }) ?? await guildModel.create({ _id: guild.id, name: guild.name });

      // Start cronjob
      const job = createCronJob(client, data);

      // Cache the data
      client.cronJobs.set(guild.id, job);
    }

    // Setup permission for bot owner
    const fullPermissions = [
      {
        id: '924397248228524032',
        permissions: [{
          id: client.application?.owner?.id || '130846699953324032',
          type: 2,
          permission: true,
        }],
      },
      {
        id: '924397251936288778',
        permissions: [{
          id: client.application?.owner?.id || '130846699953324032',
          type: 2,
          permission: true,
        }],
      },
      {
        id: '924397334006226985',
        permissions: [{
          id: client.application?.owner?.id || '130846699953324032',
          type: 2,
          permission: true,
        }],
      },
    ];

    // Set permissions for slash commands
    for (const guild of client.guilds.cache.values()) {
      await guild.commands.permissions.set({ fullPermissions });
    }
  },
};