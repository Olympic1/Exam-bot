const { MessageEmbed } = require('discord.js');
const { ICommand } = require('../../typings');
const { version, invite } = require('../../config.json');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'info',
  aliases: [],
  cooldown: 60,
  permissions: [],
  info: {
    description: 'Toont informatie over de bot.',
    usage: 'info',
    examples: ['info'],
  },
  async execute(message, args, client) {
    const uptime = process.uptime();
    const uptimeText = utils.formatToTime(uptime);
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptimeText}`;

    const guildCount = client.guilds.cache.size.toString();
    const memberCount = client.guilds.cache.map(guilds => guilds.memberCount).reduce((a, b) => a + b, 0).toString();
    const owner = `${await utils.getUser(message.guild, client.application.owner.id)}` || 'Olympic1#6758';

    const website = 'https://github.com/Olympic1/Exam-bot/';

    const INFO_EMBED = new MessageEmbed()
      .setColor('#117ea6')
      .setAuthor(client.application.name, client.application.iconURL(), website)
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

    return message.channel.send({ embeds: [INFO_EMBED] });
  },
};