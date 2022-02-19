import 'dotenv/config';
import { connect } from 'mongoose';
import { BotClient } from './structures/BotClient';
import { IHandler } from './structures/IHandler';
import { handleException, handleRejection, handleWarning } from './utils/functions';

(async () => {
  // Create the bot
  const client = new BotClient({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES'] });

  // Validate environment variables
  if (!process.env.DISCORD_TOKEN) {
    return client.logger.error('Missing Discord bot token.');
  }

  if (!process.env.MONGODB_URI) {
    return client.logger.error('Missing MongoDB url.');
  }

  if (!process.env.HEROKU_OAUTH) {
    return client.logger.warn('Missing Heroku authentication token.');
  }

  // Register the events
  const handler: IHandler = await require('./handlers/eventHandler');
  await handler.execute(client);

  // Connect to our database
  connect(process.env.MONGODB_URI, { keepAlive: true })
    .then(() => client.logger.info('Verbonden met database.'))
    .catch(error => client.logger.error('Er is een fout opgetreden bij het verbinden met de database.', error));

  // Handle errors
  process.on('unhandledRejection', handleRejection);
  process.on('uncaughtExceptionMonitor', handleException);
  process.on('warning', handleWarning);

  // Log the bot in to Discord
  return client.login(process.env.DISCORD_TOKEN)
    .catch(error => client.logger.error('Er is een fout opgetreden bij het inloggen op Discord.', error));
})();