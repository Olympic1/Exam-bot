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
  async execute(message, args, client, discord, profileData) {
    const uptime = process.uptime();
    const uptimeText = client.utils.formatToTime(uptime);
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptimeText}`;

    let creator = await client.utils.getUser(message.guild, 'Olympic1#6758');
    if (!creator) creator = 'Olympic1#6758';

    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.map((guilds) => guilds.memberCount).reduce((a, b) => a + b, 0);
    const website = 'https://github.com/Olympic1/Exam-bot/';

    const INFO_EMBED = new discord.MessageEmbed()
      .setColor('#117ea6')
      .setAuthor('Examen bot', 'https://raw.githubusercontent.com/Olympic1/Exam-bot/master/icoon/ExamenBot.png', website)
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
          value: creator,
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