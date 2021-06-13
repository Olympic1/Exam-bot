const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @param {BotClient} client */
module.exports = async (client) => {
  // Show that the bot is logged in and ready to use
  client.log.info(`Ingelogd als ${client.user.username}.`);

  // Set the bot's status
  const status = process.env.NODE_ENV !== 'production' ? 'Testing' : 'Marathonradio';
  const type = process.env.NODE_ENV !== 'production' ? 'PLAYING' : 'LISTENING';

  utils.setBotStatus(client, status, type);

  // Get all the guilds from our database and cache it, so we don't have to query it each time
  for (const guild of client.guilds.cache) {
    const guildId = guild[1].id;

    // Search the guild in our database. If we didn't find the guild, create a profile for it.
    const data = await guildModel.findOne({ _id: guildId }) ?? await guildModel.create({ _id: guildId });

    // Start cronjob
    data.job = require('../../utils/job')(client, data);

    // Cache the data
    client.guildInfo.set(guildId, data);
  }

  client.log.info(`Cached ${client.guildInfo.size} guilds.`);

  // Set up our slash commands
  for (const command of client.commands) {
    const { name, description, slash, info } = command[1];
    const { minArgs, expectedArgs } = info;

    // Setup slash command
    const data = {
      name: name,
      description: description,
      options: [],
    };

    // Check if the command needs to be a slash command
    if (slash) {
      const options = [];

      // Check if the slash command needs arguments
      if (expectedArgs) {
        // Split the arguments
        const opts = expectedArgs
          .substring(1, expectedArgs.length - 1)
          .split(/[>\]] [<[]/);

        // Set up the options
        for (let i = 0; i < opts.length; ++i) {
          const opt = opts[i];

          options.push({
            name: opt.replace(/ /g, '-'),
            type: 'STRING',
            description: opt,
            required: i < minArgs,
          });
        }

        data.options = options;
      }

      // Create slash command for the bot
      await client.guilds.cache.get('737211146943332462')?.commands.create(data);
    }
  }
};