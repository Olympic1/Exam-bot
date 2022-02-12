const { MessageEmbed, version } = require('discord.js');
const { ICommand } = require('../../structures/ICommand');
const { formatToDuration, getUser } = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'info',
  description: 'Toont informatie over de bot.',
  cooldown: 60,
  slash: 'both',
  maxArgs: 0,
  examples: ['info'],

  async execute(client, message, args) {
    // Get uptime
    const uptime = formatToDuration(process.uptime());
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptime}`;

    // Get all the guilds the bot is in and its members
    const guildCount = client.guilds.cache.size.toString();
    const memberCount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0).toString();

    // Get bot owner if he's in the guild
    const owner = `${await getUser(message.guild, client.application?.owner?.id) || 'Olympic1#6758'}`;

    // Generate a bot invite
    const inviteBot = client.generateInvite({
      scopes: ['bot', 'applications.commands'],
      permissions: ['VIEW_CHANNEL', 'CHANGE_NICKNAME', 'SEND_MESSAGES', 'SEND_MESSAGES_IN_THREADS', 'EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS', 'USE_EXTERNAL_EMOJIS', 'MENTION_EVERYONE', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
    });

    const inviteGuild = 'https://discord.gg/Ypt9cwsf48';
    const sourceCode = 'https://github.com/Olympic1/Exam-bot/';

    // Construct info embed
    const INFO_EMBED = new MessageEmbed()
      .setColor('#117ea6')
      .setAuthor({
        name: client.application?.name || 'Examen bot',
        url: sourceCode,
        iconURL: client.application?.iconURL() || '',
      })
      .addFields(
        {
          name: 'Versie',
          value: process.env.npm_package_version || (await require('../../../package.json')).version,
          inline: true,
        },
        {
          name: 'Discord.js',
          value: version,
          inline: true,
        },
        {
          name: 'Node.js',
          value: process.versions.node,
          inline: true,
        },
        {
          name: 'Servers',
          value: guildCount,
          inline: true,
        },
        {
          name: 'Gebruikers',
          value: memberCount,
          inline: true,
        },
        {
          name: 'Maker',
          value: owner,
          inline: true,
        },
        {
          name: 'Uitnodigen',
          value: `[Invite bot](${inviteBot})`,
          inline: true,
        },
        {
          name: 'Support server',
          value: `[Get Support](${inviteGuild})`,
          inline: true,
        },
        {
          name: 'Website',
          value: `[Source Code](${sourceCode})`,
          inline: true,
        },
      )
      .setFooter({ text: footer });

    return ['embed', INFO_EMBED];
  },
};