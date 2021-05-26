const discord = require('discord.js');

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
    const uptimeText = client.utils.formatToTime(uptime);
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptimeText}`;

    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.map(guilds => guilds.memberCount).reduce((a, b) => a + b, 0);
    const owner = await client.utils.getUser(message.guild, client.config.owner) || 'Olympic1#6758';

    const avatar = 'https://raw.githubusercontent.com/Olympic1/Exam-bot/master/icoon/ExamenBot.png';
    const website = 'https://github.com/Olympic1/Exam-bot/';

    const INFO_EMBED = new discord.MessageEmbed()
      .setColor('#117ea6')
      .setAuthor(client.user.username, avatar, website)
      .addFields(
        {
          name: 'Versie',
          value: client.config.version,
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
          value: `[examen-bot.gg/invite](${client.config.invite})`,
          inline: true,
        },
      )
      .setFooter(footer);

    return message.channel.send(INFO_EMBED);
  },
};