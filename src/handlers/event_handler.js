const { readdirSync } = require('fs');
const { BotClient } = require('../typings');

/** @param {BotClient} client */
module.exports = (client) => {
  // Get all the folders in 'events/'
  const eventFolders = readdirSync('./src/events');

  for (const folder of eventFolders) {
    // Get all the JavaScript files in the folder
    const eventFiles = readdirSync(`./src/events/${folder}`).filter(file => file.endsWith('.js'));

    // Add all the found events
    for (const file of eventFiles) {
      const event = require(`../events/${folder}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client));
    }
  }
};