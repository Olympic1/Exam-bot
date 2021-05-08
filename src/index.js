require('dotenv').config();
const discord = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');

// Create the bot
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION'] });
client.commands = new discord.Collection();
client.events = new discord.Collection();
client.config = require('../config.json');
client.utils = require('./utils/functions');

// Register the handlers
const handlerFiles = fs.readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
for (const handler of handlerFiles) {
  require(`./handlers/${handler}`)(client, discord);
}

// Connect to our database
mongoose.connect(process.env.MONGODB_SRV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
}).then(() => {
  console.info('Verbonden met database!');
}).catch((error) => {
  console.error(`Er is een fout opgetreden bij het verbinden met onze database.\n${error}`);
});

// Log the bot in to Discord
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error(`Er is een fout opgetreden bij het inloggen op Discord.\n${error}`);
});