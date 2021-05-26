const discord = require('discord.js');

module.exports = {
  name: 'help',
  aliases: ['h'],
  cooldown: 0,
  permissions: [],
  info: {
    description: 'Toont al mijn commando\'s met nuttige informatie.',
    usage: 'help [commando]',
    examples: ['help prefix', 'help examen'],
  },
  async execute(message, args, client) {
    const prefix = client.guildInfo.get(message.guild.id).prefix;

    // HELP_EMBED will only be sent if the user didn't pass any arguments.
    // This is the main help embed that displays each command.
    const HELP_EMBED = new discord.MessageEmbed()
      .setColor('#338333')
      .setTitle('Help');

    let description = `Voor meer informatie over elk commando, typ \`${prefix}help <commando>\`.`;
    const userCommands = [];
    const adminCommands = [];

    client.commands.each(command => {
      const commandInfo = `\`${prefix}${command.name}\` - ${command.info.description}`;

      // Check if the command is only for the bot owner
      if (command.ownerOnly) return;

      // Check if the command is only for administrators
      if (command.permissions.includes('ADMINISTRATOR')) return adminCommands.push(commandInfo);

      return userCommands.push(commandInfo);
    });

    if (userCommands.length) description += `\n\n${userCommands.join('\n')}`;
    if (adminCommands.length) description += `\n\n**Admin commando's:**\n\n${adminCommands.join('\n')}`;

    HELP_EMBED.setDescription(description);

    if (!args[0]) return await message.channel.send(HELP_EMBED);

    // When a user sends a second argument, this means they require more information on a specific command.
    // For this we get the command from the 'client.commands' collection.
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Check if the command or alias exist
    if (!command || command.ownerOnly) return message.reply(`er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

    // Check if the command has an 'info' object for us to send information about the command
    if (!command.info.description || !command.info.usage || !command.info.examples) return message.channel.send(`**Coding Error**, neem contact op met <@${client.config.owner}>.`);

    const admin = command.permissions.includes('ADMINISTRATOR') ? '(enkel voor admins)' : '';
    const aliases = command.aliases.length ? command.aliases.join('`, `') : 'geen';

    const COMMAND_EMBED = new discord.MessageEmbed()
      .setColor('#338333')
      .setTitle(`\`${command.name}\` commando ${admin}`)
      .addFields(
        {
          name: 'Beschrijving',
          value: command.info.description,
        },
        {
          name: 'Aliassen',
          value: `\`${aliases}\``,
        },
        {
          name: 'Gebruik',
          value: `\`${prefix}${command.info.usage}\``,
        },
        {
          name: 'Voorbeelden',
          value: `\`${prefix}${command.info.examples.join(`\`\n\`${prefix}`)}\``,
        },
      );

    return await message.channel.send(COMMAND_EMBED);
  },
};