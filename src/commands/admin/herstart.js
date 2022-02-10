const { default: fetch } = require('node-fetch');
const { ICommand } = require('../../typings');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'herstart',
  aliases: ['restart'],
  description: 'Herstart de bot.',
  cooldown: 60,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  info: {
    maxArgs: 1,
    expectedArgs: '[tijd]',
    examples: ['herstart 20s', 'herstart 5m'],
  },
  async execute(message, args, client) {
    // Get the provided time in seconds. Defaults to 1 minute.
    const limit = utils.parseTimeLimit(args[0]) || 60;

    // Check if parseTimeLimit returned an error message
    if (typeof limit === 'string') return ['reply', limit];

    const timeText = utils.formatToTime(limit);

    // Message all the possible guilds about restarting the bot
    let channel;
    for (const info of client.guildInfo) {
      const guild = client.guilds.cache.get(info[0]);
      channel = guild.channels.cache.get(info[1].examChannel);

      // Check if the guild has a channel set, otherwise message the guild owner
      if (!channel?.isText()) channel = await guild.fetchOwner();

      await channel.send(`Attentie! Over ${timeText} zal ik mezelf opnieuw opstarten.`);
    }

    // Send a request to Heroku to restart the bot
    return setTimeout(async () => {
      channel.send('Opnieuw opstarten...');

      await fetch('https://api.heroku.com/apps/mnm-exam-bot/dynos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.heroku+json; version=3',
          'Authorization': `Bearer ${process.env.HEROKU_OAUTH}`,
        },
      });
    }, limit * 1000);
  },
};