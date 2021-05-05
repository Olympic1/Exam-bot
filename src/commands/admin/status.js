module.exports = {
  name: 'status',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'',
    usage: 'status <bericht>',
    examples: ['status jullie examens'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer de status in die u wilt instellen.');

    const content = args.join(' ');
    client.user.setPresence({
      activity: {
        name: content,
        type: 'LISTENING',
      },
    }).catch((error) => {
      console.error(`An error occurred when trying to set the status of the bot after changing the status.\n${error}`);
      return message.channel.send('Er is een fout opgetreden bij het instellen van de nieuwe status.');
    });

    return message.channel.send(`Mijn status is succesvol veranderd naar \`${content}\`.`);
  },
};