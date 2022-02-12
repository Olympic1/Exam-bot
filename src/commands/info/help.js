const { MessageEmbed } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const { ICommand } = require('../../structures/ICommand');

/** @type {ICommand} */
module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'Toont al mijn commando\'s met nuttige informatie.',
  slash: 'both',
  maxArgs: 1,
  expectedArgs: ['commando'],
  examples: ['help prefix', 'help examen'],

  async execute(client, message, args) {
    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: message.guild.id });

    // Check null
    if (!data) return;

    // Get the current prefix
    const prefix = message.type === 'APPLICATION_COMMAND' ? '/' : data.prefix;

    // HELP_EMBED will only be sent if the user didn't pass any arguments.
    // This is the main help embed that displays each command.
    if (!args.length) {
      const HELP_EMBED = new MessageEmbed()
        .setColor('#338333')
        .setTitle('Help');

      let desc = `Voor meer informatie over elk commando, typ \`${prefix}help <commando>\`.`;
      /** @type {string[]} */
      const userCommands = [];
      /** @type {string[]} */
      const modCommands = [];
      /** @type {string[]} */
      const adminCommands = [];

      for (const command of client.commands.values()) {
        const { name, description, permissions, ownerOnly } = command;

        const commandInfo = `\`${prefix}${name}\`` + (description ? ` - ${description}` : '');

        // Check if the command is only for the bot owner
        if (ownerOnly) continue;

        // Check if the command is only for moderators
        if (permissions?.includes('KICK_MEMBERS') || permissions?.includes('BAN_MEMBERS')) {
          modCommands.push(commandInfo);
          continue;
        }

        // Check if the command is only for administrators
        if (permissions?.includes('ADMINISTRATOR')) {
          adminCommands.push(commandInfo);
          continue;
        }

        userCommands.push(commandInfo);
      }

      // Construct help embed
      if (userCommands.length) desc += `\n\n${userCommands.join('\n')}`;
      if (modCommands.length) desc += `\n\n**Moderator commando's:**\n\n${modCommands.join('\n')}`;
      if (adminCommands.length) desc += `\n\n**Administrator commando's:**\n\n${adminCommands.join('\n')}`;

      HELP_EMBED.setDescription(desc);

      return ['embed', HELP_EMBED];
    }

    // When a user sends an argument, this means they require more information on a specific command.
    // For this we get the command from the 'client.commands' collection.
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName) || client.aliases.get(commandName);

    // Check if the command or alias exist
    if (!command || command.ownerOnly) return ['reply', `Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`];

    const { name, aliases, description, permissions, minArgs, expectedArgs, examples } = command;

    // Construct help embed
    const isAdmin = permissions?.includes('ADMINISTRATOR') ? '(enkel voor administrators)' : '';
    const isMod = permissions?.includes('KICK_MEMBERS') || permissions?.includes('BAN_MEMBERS') ? '(enkel voor moderators)' : '';

    let usage = '';
    if (expectedArgs?.length) {
      for (let i = 0; i < expectedArgs.length; ++i) {
        const open = i < (minArgs || 0) ? '<' : '[';
        const close = i < (minArgs || 0) ? '>' : ']';

        usage += ` ${open}${expectedArgs[i]}${close}`;
      }
    }

    const aliasList = aliases?.length ? aliases.join('`, `') : 'Geen aliassen';
    const commandUsage = `${prefix}${name}` + usage;
    const exampleList = examples?.length ? `${prefix}${examples.join(`\`\n\`${prefix}`)}` : 'Geen voorbeelden';

    const COMMAND_EMBED = new MessageEmbed()
      .setColor('#338333')
      .setTitle(`\`${name}\` commando ${isAdmin || isMod}`)
      .addFields(
        {
          name: 'Beschrijving',
          value: description || 'Geen beschrijving',
        },
        {
          name: 'Aliassen',
          value: `\`${aliasList}\``,
        },
        {
          name: 'Gebruik',
          value: `\`${commandUsage}\``,
        },
        {
          name: 'Voorbeelden',
          value: `\`${exampleList}\``,
        },
      );

    return ['embed', COMMAND_EMBED];
  },
};