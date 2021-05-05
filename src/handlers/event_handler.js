const fs = require('fs');

module.exports = (client, discord) => {
  // Get all the folders in 'events/'
  const eventFolders = fs.readdirSync('./src/events');

  for (const folder of eventFolders) {
    // Get all the JavaScript files in the folder
    const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter(file => file.endsWith('.js'));

    // Add all the found events
    for (const file of eventFiles) {
      const event = require(`../events/${folder}/${file}`);
      const eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client, discord));
    }
  }
};