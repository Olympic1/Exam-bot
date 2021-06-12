const { MessageEmbed } = require('discord.js');
const { ICommand } = require('../../typings');

/** @type {ICommand} */
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
    if (!args.length) {
      const HELP_EMBED = new MessageEmbed()
        .setColor('#338333')
        .setTitle('Help');

      let desc = `Voor meer informatie over elk commando, typ \`${prefix}help <commando>\`.`;
      const userCommands = [];
      const modCommands = [];
      const adminCommands = [];

      for (const command of client.commands) {
        const { name, permissions, ownerOnly, info } = command[1];
        const { description } = info;

        const commandInfo = `\`${prefix}${name}\`${description ? ` - ${description}` : ''}`;

        // Check if the command is only for the bot owner
        if (ownerOnly) continue;

        // Check if the command is only for moderators
        if (permissions.includes('KICK_MEMBERS') || permissions.includes('BAN_MEMBERS')) {
          modCommands.push(commandInfo);
          continue;
        }

        // Check if the command is only for administrators
        if (permissions.includes('ADMINISTRATOR')) {
          adminCommands.push(commandInfo);
          continue;
        }

        userCommands.push(commandInfo);
      }

      if (userCommands.length) desc += `\n\n${userCommands.join('\n')}`;
      if (modCommands.length) desc += `\n\n**Moderator commando's:**\n\n${modCommands.join('\n')}`;
      if (adminCommands.length) desc += `\n\n**Administrator commando's:**\n\n${adminCommands.join('\n')}`;

      HELP_EMBED.setDescription(desc);

      return await message.channel.send({ embeds: [HELP_EMBED] });
    }

    // When a user sends a second argument, this means they require more information on a specific command.
    // For this we get the command from the 'client.commands' collection.
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Check if the command or alias exist
    if (!command || command.ownerOnly) return message.reply(`Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

    const { name, aliases, permissions, info } = command;
    const { description, usage, examples } = info;

    // Check if the command has an 'info' object for us to send information about the command
    if (!description || !usage || !examples) return message.channel.send(`**Coding Error**, neem contact op met <@${client.application.owner.id}>.`);

    const isAdmin = permissions.includes('ADMINISTRATOR') ? '(enkel voor administrators)' : '';
    const isMod = permissions.includes('KICK_MEMBERS') || permissions.includes('BAN_MEMBERS') ? '(enkel voor moderators)' : '';

    const aliasList = aliases.length ? aliases.join('`, `') : 'geen';
    const exampleList = examples.length ? `${prefix}${examples.join(`\`\n\`${prefix}`)}` : 'geen';

    const COMMAND_EMBED = new MessageEmbed()
      .setColor('#338333')
      .setTitle(`\`${name}\` commando ${isAdmin || isMod}`)
      .addFields(
        {
          name: 'Beschrijving',
          value: description,
        },
        {
          name: 'Aliassen',
          value: `\`${aliasList}\``,
        },
        {
          name: 'Gebruik',
          value: `\`${prefix}${usage}\``,
        },
        {
          name: 'Voorbeelden',
          value: `\`${exampleList}\``,
        },
      );

    return await message.channel.send({ embeds: [COMMAND_EMBED] });
  },
};