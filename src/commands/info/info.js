const { MessageEmbed } = require('discord.js');
const { ICommand } = require('../../typings');
const { version, invite } = require('../../config.json');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'info',
  aliases: [],
  description: 'Toont informatie over de bot.',
  cooldown: 60,
  permissions: [],
  slash: 'both',
  info: {
    maxArgs: 0,
    examples: ['info'],
  },
  async execute(message, args, client) {
    // Get uptime
    const uptime = process.uptime();
    const uptimeText = utils.formatToTime(uptime);
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptimeText}`;

    // Get all the guilds the bot is in and its members
    const guildCount = client.guilds.cache.size.toString();
    const memberCount = client.guilds.cache.map(guilds => guilds.memberCount).reduce((a, b) => a + b, 0).toString();

    // Get bot owner if he's in the guild
    const owner = `${await utils.getUser(message.guild, client.application.owner.id)}` || 'Olympic1#6758';
    const website = 'https://github.com/Olympic1/Exam-bot/';

    // Construct info embed
    const INFO_EMBED = new MessageEmbed()
      .setColor('#117ea6')
      .setAuthor(
        {
          name: client.application.name,
          url: website,
          iconURL: client.application.iconURL(),
        },
      )
      .addFields(
        {
          name: 'Versie',
          value: version,
          inline: true,
        },
        {
          name: 'Bibliotheek',
          value: 'discord.js',
          inline: true,
        },
        {
          name: 'Maker',
          value: owner,
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
          name: 'Website',
          value: `[examen-bot.gg](${website})`,
          inline: true,
        },
        {
          name: 'Uitnodigen',
          value: `[examen-bot.gg/invite](${invite})`,
          inline: true,
        },
      )
      .setFooter(footer);

    return ['embed', INFO_EMBED];
  },
};