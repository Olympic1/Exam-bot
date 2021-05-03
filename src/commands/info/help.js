module.exports = {
  name: 'help',
  aliases: ['h'],
  cooldown: 0,
  permissions: [],
  info: {
    description: `Toont al mijn commando's met nuttige informatie.`,
    usage: 'help [commando]',
    examples: ['help prefix', 'help exam']
  },
  async execute(message, args, client, discord, profileData) {
    const prefix = client.config.prefix;

    // HELP_EMBED will be sent only if the user didn't pass any arguments.
    // This is the main help embed that displays each command.
    const HELP_EMBED = new discord.MessageEmbed()
      .setColor('#338333')
      .setTitle('Help')
      .setFooter(`Gebruik  ${prefix}  prefix voor elk commando.`);

    let description = `Voor meer informatie over elk commando, typ \`${prefix}help <commando>\`.\n\n`;

    for (const cmd of client.commands) {
      const command = client.commands.get(cmd[0]) || client.commands.find((c) => c.aliases && c.aliases.includes(cmd[0]));
      description += `\`${command.name}\` - ${command.info.description}\n`;
    }

    HELP_EMBED.setDescription(description);

    if (!args[0]) return await message.channel.send(HELP_EMBED);

    // When a user sends a second argument, this means they require more information on a specific command.
    // For this we get the command from the 'client.commands' collection.
    // Each command must have an 'info' key for us to send information about the command.
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return message.reply(`Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${client.config.prefix}help\` voor meer informatie over mijn commando's.`);
    if (!command.info.description || !command.info.usage || !command.info.examples) return message.channel.send(`**Code Error**, neem contact op met <@${client.config.owner}>`);

    let aliases;

    if (command.aliases.length) aliases = command.aliases.join('`, `');
    else aliases = 'geen';

    const COMMAND_EMBED = new discord.MessageEmbed()
      .setColor('#338333')
      .setTitle(`\`${command.name}\` commando`)
      .addFields(
        {
          name: 'Beschrijving',
          value: command.info.description
        },
        {
          name: 'Aliassen',
          value: `\`${aliases}\``
        },
        {
          name: 'Gerbuik',
          value: `\`${prefix}${command.info.usage}\``
        },
        {
          name: 'Voorbeelden',
          value: `\`${prefix}${command.info.examples.join(`\`\n\`${prefix}`)}\``
        }
      );

    return await message.channel.send(COMMAND_EMBED);
  }
}