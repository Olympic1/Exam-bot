const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @param {BotClient} client */
module.exports = async (client) => {
  if (!client.application?.owner) await client.application?.fetch();

  // Are we testing the bot
  const testing = process.env.NODE_ENV !== 'production';

  // Show that the bot is logged in and ready to use
  client.log.info(`Ingelogd als ${client.user.username}.`);

  // Set the bot's status
  const status = testing ? 'Testing' : 'Marathonradio';
  const type = testing ? 'PLAYING' : 'LISTENING';

  utils.setBotStatus(client, status, type);

  // Set up our slash commands
  for (const command of client.commands) {
    const { name, description, slash, info, ownerOnly } = command[1];
    const { minArgs, expectedArgs } = info;

    // Check if the command needs to be a slash command
    if (slash) {
      // Setup slash command
      const data = {
        name: name,
        description: description,
        options: [],
        defaultPermission: !ownerOnly,
      };

      // Check if the slash command needs arguments
      if (expectedArgs) {
        const options = [];

        // Split the arguments
        const opts = expectedArgs
          .substring(1, expectedArgs.length - 1)
          .split(/[>\]] [<[]/);

        // Set up the options
        for (let i = 0; i < opts.length; ++i) {
          const opt = opts[i];

          options.push({
            name: opt.replace(/ +/, '-').toLowerCase(),
            type: 'STRING',
            description: opt,
            required: i < minArgs,
          });
        }

        data.options = options;
      }

      // Use the guild if we're testing the bot, otherwise set to the client
      const guild = testing ? client.guilds.cache.get('737211146943332462') : client.application;

      // Create slash command for the bot
      await guild?.commands.create(data);
    }
  }

  // Setup permission for bot owner
  const fullPermissions = [
    {
      id: '924397248228524032',
      permissions: [{
        id: client.application.owner.id,
        type: 2,
        permission: true,
      }],
    },
    {
      id: '924397251936288778',
      permissions: [{
        id: client.application.owner.id,
        type: 2,
        permission: true,
      }],
    },
    {
      id: '924397334006226985',
      permissions: [{
        id: client.application.owner.id,
        type: 2,
        permission: true,
      }],
    },
  ];

  // Get all the guilds from our database and cache it, so we don't have to query it each time
  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    // Set permissions for slash commands
    await guild[1].commands.permissions.set({ fullPermissions });

    // Search the guild in our database. If we didn't find the guild, create a profile for it.
    const data = await guildModel.findOne({ _id: guildId }) ?? await guildModel.create({ _id: guildId });

    // Start cronjob
    data.job = require('../../utils/job')(client, data);

    // Cache the data
    client.guildInfo.set(guildId, data);
  }

  client.log.info(`Cached ${client.guildInfo.size} guilds.`);
};