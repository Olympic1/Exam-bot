const fetch = require('node-fetch');

module.exports = {
  name: 'herstart',
  aliases: ['restart'],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  info: {
    description: 'Herstart de bot.',
    usage: 'herstart [time]',
    examples: ['herstart'],
  },
  async execute(message, args, client, discord, profileData) {
    // Get the provided time in seconds. Defaults to 1 minute.
    const limit = client.utils.parseTimeLimit(args[0]) || 60;
    const timeText = client.utils.formatToTime(limit);

    // Message all the possible guilds about restarting the bot
    let channel;
    client.guildInfo.forEach(guild => {
      channel = client.channels.cache.get(guild.examChannel);

      // Check if the guild has a channel set, otherwise message the guild owner
      if (!channel) channel = client.guilds.cache.get(guild._id).owner;

      channel.send(`Attentie! Over ${timeText} zal ik mezelf opnieuw opstarten.`);
    });

    // Send a request to Heroku to restart the bot
    setTimeout(async () => {
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