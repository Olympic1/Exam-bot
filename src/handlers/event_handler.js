const { readdirSync } = require('fs');
const { IEvent } = require('../structures/IEvent');
const { IHandler } = require('../structures/IHandler');

/** @type {IHandler} */
module.exports = {
  async execute(client) {
    // Get all the folders in 'events/'
    const eventFolders = readdirSync('./src/events');

    for (const folder of eventFolders) {
      // Get all the JavaScript files in the folder
      const eventFiles = readdirSync(`./src/events/${folder}`).filter(file => file.endsWith('.js'));

      // Add all the found events
      for (const file of eventFiles) {
        /** @type {IEvent} */
        const event = await require(`../events/${folder}/${file}`);

        // Check if the event exists
        if (!event) continue;

        if (event.once) {
          client.once(event.name, event.execute.bind(null, client));
        } else {
          client.on(event.name, event.execute.bind(null, client));
        }
      }
    }
  },
};