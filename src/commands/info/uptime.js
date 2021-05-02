module.exports = {
  name: 'uptime',
  aliases: ['up'],
  cooldown: 3,
  permissions: [],
  info: {
    description: `Krijg de uptime van de bot.`,
    usage: 'uptime',
    examples: ['up', 'uptime']
  },
  execute(message, args, client, discord, profileData) {
    const uptime = process.uptime();
    const uptimeText = client.utils.formatToTime(uptime);
    const started = client.utils.formatToDate((Date.now() - (uptime * 1000)));
    const footer = `PID ${process.pid} | Enceladus | Gehost door Heroku | Laatst gestart op ${started}`;

    const UPTIME_EMBED = new discord.MessageEmbed()
      .setColor('#117ea6')
      .setTitle('Uptime')
      .setDescription(uptimeText)
      .setFooter(footer);

    return message.channel.send(UPTIME_EMBED);
  }
}