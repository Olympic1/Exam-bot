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

      let description = `Voor meer informatie over elk commando, typ \`${prefix}help <commando>\`.`;
      const userCommands = [];
      const modCommands = [];
      const adminCommands = [];

      client.commands.each(command => {
        const commandInfo = `\`${prefix}${command.name}\` - ${command.info.description}`;

        // Check if the command is only for the bot owner
        if (command.ownerOnly) return;

        // Check if the command is only for moderators
        if (command.permissions.includes('KICK_MEMBERS') || command.permissions.includes('BAN_MEMBERS')) return modCommands.push(commandInfo);

        // Check if the command is only for administrators
        if (command.permissions.includes('ADMINISTRATOR')) return adminCommands.push(commandInfo);

        return userCommands.push(commandInfo);
      });

      if (userCommands.length) description += `\n\n${userCommands.join('\n')}`;
      if (modCommands.length) description += `\n\n**Moderator commando's:**\n\n${modCommands.join('\n')}`;
      if (adminCommands.length) description += `\n\n**Administrator commando's:**\n\n${adminCommands.join('\n')}`;

      HELP_EMBED.setDescription(description);

      return await message.channel.send(HELP_EMBED);
    }

    // When a user sends a second argument, this means they require more information on a specific command.
    // For this we get the command from the 'client.commands' collection.
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Check if the command or alias exist
    if (!command || command.ownerOnly) return message.reply(`er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

    // Check if the command has an 'info' object for us to send information about the command
    if (!command.info.description || !command.info.usage || !command.info.examples) return message.channel.send(`**Coding Error**, neem contact op met <@${client.application.owner}>.`);

    const isAdmin = command.permissions.includes('ADMINISTRATOR') ? '(enkel voor administrators)' : '';
    const isMod = command.permissions.includes('KICK_MEMBERS') || command.permissions.includes('BAN_MEMBERS') ? '(enkel voor moderators)' : '';

    const aliasList = command.aliases.length ? command.aliases.join('`, `') : 'geen';
    const exampleList = command.info.examples.length ? `${prefix}${command.info.examples.join(`\`\n\`${prefix}`)}` : 'geen';

    const COMMAND_EMBED = new MessageEmbed()
      .setColor('#338333')
      .setTitle(`\`${command.name}\` commando ${isAdmin || isMod}`)
      .addFields(
        {
          name: 'Beschrijving',
          value: command.info.description,
        },
        {
          name: 'Aliassen',
          value: `\`${aliasList}\``,
        },
        {
          name: 'Gebruik',
          value: `\`${prefix}${command.info.usage}\``,
        },
        {
          name: 'Voorbeelden',
          value: `\`${exampleList}\``,
        },
      );

    return await message.channel.send(COMMAND_EMBED);
  },
};