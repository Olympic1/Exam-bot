module.exports = {
  name: 'info',
  aliases: [],
  cooldown: 60,
  permissions: [],
  info: {
    description: 'Krijg wat informatie over de bot.',
    usage: 'info',
    examples: ['info']
  },
  execute(message, args, client, discord, profileData) {
    const uptime = process.uptime();
    const uptimeText = client.utils.formatToTime(uptime);
    const footer = `Enceladus | Gehost door Heroku | Uptime: ${uptimeText}`;

    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.map((guilds) => guilds.memberCount).reduce((a, b) => a + b, 0);
    const website = 'https://github.com/Olympic1/Exam-bot/';

    const INFO_EMBED = new discord.MessageEmbed()
      .setColor('#117ea6')
      .setAuthor('Exam bot', 'https://raw.githubusercontent.com/Olympic1/Exam-bot/master/ExamBot.png', website)
      .addFields(
        {
          name: 'Version',
          value: process.env.npm_package_version,
          inline: true
        },
        {
          name: 'Library',
          value: 'discord.js',
          inline: true
        },
        {
          name: 'Creator',
          value: 'Olympic1#6758',
          inline: true
        },
        {
          name: 'Servers',
          value: guildCount,
          inline: true
        },
        {
          name: 'Users',
          value: memberCount,
          inline: true
        },
        {
          name: 'Website',
          value: `[exam-bot.gg](${website})`,
          inline: true
        },
        {
          name: 'Invite',
          value: `[exam-bot.gg/invite](${client.config.invite})`,
          inline: true
        },
        // {
        //   name: 'Discord',
        //   value: '[mnm.be/discord](https://discord.gg/Mb4nXQD)',
        //   inline: true
        // },
        // {
        //   name: 'Donate',
        //   value: '[mnm.be/donate](https://www.patreon.com/_pjf)',
        //   inline: true
        // }
      )
      .setFooter(footer);

    return message.channel.send(INFO_EMBED);
  }
}