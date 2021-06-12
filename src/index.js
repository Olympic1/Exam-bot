require('dotenv').config();
const fs = require('fs');
const discord = require('discord.js');
const mongoose = require('mongoose');
const winston = require('winston');
const config = require('./config.json');
const { BotClient } = require('./typings');

// Create logger
const logger = winston.createLogger({
  transports: [new winston.transports.Console({ handleExceptions: true })],
  format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  exitOnError: false,
});

// Create the bot
/** @type {BotClient} */
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION'] });
client.commands = new discord.Collection();
client.guildInfo = new discord.Collection();
client.config = config;
client.log = logger;

// Register the handlers
const handlerFiles = fs.readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
for (const handler of handlerFiles) {
  require(`./handlers/${handler}`)(client);
}

// Connect to our database
mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => client.log.info('Verbonden met database.'))
  .catch(error => client.log.error('Er is een fout opgetreden bij het verbinden met de database.', error));

// Log the bot in to Discord
client.login(process.env.DISCORD_TOKEN)
  .catch(error => client.log.error('Er is een fout opgetreden bij het inloggen op Discord.', error));