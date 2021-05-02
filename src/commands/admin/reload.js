const fs = require('fs');

module.exports = {
  name: 'reload',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Laadt een commando opnieuw. Handig als je wat wijzigingen in de code hebt aangebracht.',
    usage: 'reload <commando>',
    examples: ['reload ping', 'reload exam']
  },
  execute(message, args, client, discord, profileData) {
    const isBotOwner = message.author.id === client.config.owner;

    if (!isBotOwner) return message.reply('Je mag dit commando niet uitvoeren.');
    if (!args.length) return message.reply('Voer het commando of alias in om te herladen.');

    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.reply(`Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${client.config.prefix}help\` voor meer informatie over mijn commando's.`);

    try {
      const commandFolders = fs.readdirSync('./src/commands');

      for (const folder of commandFolders) {
        if (fs.existsSync(`./src/commands/${folder}/${command.name}.js`)) {
          // Delete the outdated file from the cache
          delete require.cache[require.resolve(`../${folder}/${command.name}.js`)];
          client.commands.delete(command.name);

          // Add the updated file to the cache
          const newCommand = require(`../${folder}/${command.name}.js`);
          client.commands.set(newCommand.name, newCommand);
        }
      }

      message.channel.send(`Commando \`${command.name}\` werd opnieuw geladen!`);
    } catch (error) {
      console.error(`An error occurred when trying to reload the command '${command.name}'.\n${error}`);
      message.channel.send(`Er is een fout opgetreden bij het herladen van het commando \`${command.name}\`.`);
    }
  }
}