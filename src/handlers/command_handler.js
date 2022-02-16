const { ApplicationCommandData, ApplicationCommandOptionData } = require('discord.js');
const { readdirSync } = require('fs');
const { ICommand } = require('../structures/ICommand');
const { IHandler } = require('../structures/IHandler');

/** @type {IHandler} */
module.exports = {
  async execute(client) {
    // Get all the folders in 'commands/'
    const commandFolders = readdirSync('./src/commands');

    for (const folder of commandFolders) {
      // Get all the JavaScript files in the folder
      const commandFiles = readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));

      // Add all the found commands
      for (const file of commandFiles) {
        /** @type {ICommand} */
        const command = await require(`../commands/${folder}/${file}`);

        // Check if the event exists
        if (!command) continue;

        const { name, aliases, description, cooldown, ownerOnly, slash, minArgs, maxArgs, expectedArgs, syntaxError, examples } = command;
        let commandError = false;

        // Check if the command has a name
        if (!name) {
          client.log.error(`Het commando in "${file}" heeft geen naam ingesteld.`);
          commandError = true;
        }

        // Check if there is an invalid alias
        if (aliases?.includes('')) {
          client.log.error(`Het commando "${name}" heeft een ongeldige alias ingesteld.`);
          commandError = true;
        }

        // Check if the command has a description
        if (!description) {
          client.log.warn(`Het commando "${name}" heeft geen beschrijving ingesteld.`);
        }

        // Check that the cooldown is not lower than 0
        if ((cooldown || 0) < 0) {
          client.log.error(`Het commando "${name}" heeft de cooldown lager ingesteld dan 0.`);
          commandError = true;
        }

        // Check if the command has a category
        // if (!category) {
        //   client.log.warn(`Het commando "${name}" heeft geen categorie ingesteld.`);
        // }

        // Check that the minimum arguments are not lower than 0
        if ((minArgs || 0) < 0) {
          client.log.error(`Het commando "${name}" heeft het minimum aantal argumenten lager ingesteld dan 0.`);
          commandError = true;
        }

        // Check that the maximum arguments are not lower than the minimum arguments or 0
        if (maxArgs < (minArgs || 0)) {
          if (maxArgs < 0) {
            client.log.error(`Het commando "${name}" heeft het maximum aantal argumenten lager ingesteld dan 0.`);
            commandError = true;
          } else {
            client.log.error(`Het commando "${name}" heeft het maximum aantal argumenten lager ingesteld dan het minimum aantal.`);
            commandError = true;
          }
        }

        // Check if the command has expectedArgs when it needs them and if they are equal to the amount of maximum arguments
        if (maxArgs > 0) {
          if (!expectedArgs?.length) {
            client.log.error(`Het commando "${name}" heeft de eigenschap "maxArgs" ingesteld zonder de eigenschap "expectedArgs".`);
            commandError = true;
          } else if (maxArgs !== expectedArgs?.length) {
            client.log.error(`Het commando "${name}" heeft een incorrect aantal "expectedArgs" ingesteld ten opzichte van "maxArgs". Er werden ${expectedArgs?.length} argumenten ingesteld, maar verwachte er ${maxArgs}.`);
            commandError = true;
          }
        }

        // Check if there is an invalid string in expectedArgs
        if (expectedArgs?.includes('')) {
          client.log.error(`Het commando "${name}" heeft een ongeldige "expectedArgs" ingesteld.`);
          commandError = true;
        }

        // Check if the command has an error message when it needs it
        if ((minArgs || 0) > 0 && !syntaxError) {
          client.log.error(`Het commando "${name}" heeft de eigenschap "minArgs" ingesteld zonder de eigenschap "syntaxError".`);
          commandError = true;
        }

        // Check if there is an invalid example
        if (examples?.length) {
          if (examples.includes('')) {
            client.log.error(`Het commando "${name}" heeft een ongeldig voorbeeld ingesteld.`);
            commandError = true;
          }
        } else {
          client.log.warn(`Het commando "${name}" heeft geen voorbeelden ingesteld.`);
        }

        if (slash) {
          // Check if the slash command has a description
          if (!description) {
            client.log.error(`Een beschrijving is vereist voor het commando "${name}" omdat het een slash commando is.`);
            commandError = true;
          }

          // Check that the maximum arguments are not greater than 25 if it's a slash command
          if (maxArgs > 25) {
            client.log.error(`Het slash commando "${name}" heeft een maximum aantal argumenten groter dan 25 ingesteld.`);
            commandError = true;
          }

          // If no errors were encountered, add the slash command to the bot
          if (!commandError) {
            /** @type {ApplicationCommandOptionData[]} */
            const options = [];

            // Set up the options
            if (expectedArgs) {
              for (let i = 0; i < expectedArgs.length; ++i) {
                const arg = expectedArgs[i];

                options.push({
                  name: arg.replace(/ +/g, '-').toLowerCase(),
                  description: arg,
                  type: 'STRING',
                  required: i < (minArgs || 0),
                });
              }
            }

            // Setup slash command
            /** @type {ApplicationCommandData} */
            const data = {
              name: name,
              description: description || 'Geen beschrijving',
              options: options,
              defaultPermission: !ownerOnly,
            };

            // Register slash command
            const guild = process.env.NODE_ENV !== 'production' ? client.guilds.cache.get('737211146943332462') : client.application;
            await guild?.commands.create(data);
          }
        }

        // If no errors were encountered, add the command to the bot
        if (!commandError) {
          client.commands.set(name, command);

          if (aliases) {
            for (const alias of aliases) {
              client.aliases.set(alias, command);
            }
          }
        }
      }
    }
  },
};