import { readdirSync } from 'fs';
import { IEvent } from '../structures/IEvent';
import { IHandler } from '../structures/IHandler';

export = {
  async execute(client) {
    // Get all the folders in 'events/'
    const eventFolders = readdirSync('./dist/events');

    for (const folder of eventFolders) {
      // Get all the JavaScript files in the folder
      const eventFiles = readdirSync(`./dist/events/${folder}`).filter(file => file.endsWith('.js'));

      // Add all the found events
      for (const file of eventFiles) {
        const event: IEvent = await require(`../events/${folder}/${file}`);

        // Check if the event exists
        if (!event) continue;

        if (event.once) {
          client.once(event.name, event.execute.bind(null, client));
        } else {
          client.on(event.name, event.execute.bind(null, client));
        }
      }
    }
  }
} as IHandler