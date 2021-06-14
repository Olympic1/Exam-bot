require('dotenv').config();
const { Client, Collection, Intents } = require('discord.js');
const { readdirSync } = require('fs');
const { connect, connection } = require('mongoose');
const { createLogger, format, transports } = require('winston');
const { BotClient } = require('./typings');

// Create logger
const logger = createLogger({
  transports: [new transports.Console({ handleExceptions: true })],
  format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  exitOnError: false,
});

/**
 * Create the bot
 * @type {BotClient}
 */
const client = new Client({ partials: ['MESSAGE', 'REACTION'], intents: [Intents.ALL] });
client.commands = new Collection();
client.guildInfo = new Collection();
client.log = logger;

// Register the handlers
const handlerFiles = readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
for (const handler of handlerFiles) {
  require(`./handlers/${handler}`)(client);
}

// Connect to our database
connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => client.log.info('Verbonden met database.'))
  .catch(error => client.log.error('Er is een fout opgetreden bij het verbinden met de database.', error));

// Handle mongoose errors
connection.on('error', error => client.log.error('Er is een fout opgetreden met de database.', error));

// Log the bot in to Discord
client.login(process.env.DISCORD_TOKEN)
  .catch(error => client.log.error('Er is een fout opgetreden bij het inloggen op Discord.', error));