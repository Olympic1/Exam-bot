require('dotenv').config();
const { connect } = require('mongoose');
const BotClient = require('./structures/BotClient');
const { IHandler } = require('./structures/IHandler');
const { handleException, handleRejection, handleWarning } = require('./utils/functions');

(async () => {
  // Create the bot
  const client = new BotClient({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'] });

  // Validate environment variables
  if (!process.env.DISCORD_TOKEN) {
    return client.log.error('Missing Discord bot token.');
  }

  if (!process.env.MONGODB_URI) {
    return client.log.error('Missing MongoDB url.');
  }

  if (!process.env.HEROKU_OAUTH) {
    return client.log.warn('Missing Heroku authentication token.');
  }

  // Register the events
  /** @type {IHandler} */
  const handler = await require('./handlers/event_handler');
  await handler.execute(client);

  // Connect to our database
  connect(process.env.MONGODB_URI, { keepAlive: true })
    .then(() => client.log.info('Verbonden met database.'))
    .catch(error => client.log.error('Er is een fout opgetreden bij het verbinden met de database.', error));

  // Handle errors
  process.on('unhandledRejection', handleRejection);
  process.on('uncaughtExceptionMonitor', handleException);
  process.on('warning', handleWarning);

  // Log the bot in to Discord
  return client.login(process.env.DISCORD_TOKEN)
    .catch(error => client.log.error('Er is een fout opgetreden bij het inloggen op Discord.', error));
})();