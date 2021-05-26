module.exports = {
  name: 'status',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  info: {
    description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'',
    usage: 'status <activiteit>',
    examples: ['status Marathonradio'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer de status in die u wilt instellen voor de bot.');

    // Set the bot's new status
    const content = args.join(' ');
    client.utils.setBotStatus(client, content, 'LISTENING')
      .catch(error => {
        client.log.error('Er is een fout opgetreden bij het instellen van de status van de bot.', error);
        return message.channel.send('Er is een fout opgetreden bij het instellen van de nieuwe status.');
      });

    return message.channel.send(`Mijn status is succesvol veranderd naar \`${content}\`.`);
  },
};