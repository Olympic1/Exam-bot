module.exports = {
  name: 'ping',
  aliases: [],
  cooldown: 3,
  permissions: [],
  info: {
    description: 'Ping de bot.',
    usage: 'ping',
    examples: ['ping']
  },
  execute(message, args, client, discord, profileData) {
    const start = Date.now();
    return message.channel.send('Pong!')
      .then(msg => {
        const diff = (Date.now() - start);
        return msg.edit(`Pong! \`${diff}ms\``);
      });
  }
}