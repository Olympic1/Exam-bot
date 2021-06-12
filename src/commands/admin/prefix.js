const { ICommand } = require('../../typings');
const guildModel = require('../../models/guildModel');

/** @type {ICommand} */
module.exports = {
  name: 'prefix',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander de prefix van de bot.',
    usage: 'prefix <prefix>',
    examples: ['prefix ?', 'prefix -'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer de prefix in die u wilt gebruiken.');

    let data = client.guildInfo.get(message.guild.id);
    const newPrefix = args[0];

    if (data.prefix === newPrefix) return message.reply('die prefix gebruik ik nu al.');

    try {
      // Change prefix in the database
      data = await guildModel.findOneAndUpdate(
        {
          _id: message.guild.id,
        },
        {
          prefix: newPrefix,
        },
        {
          new: true,
        },
      );

      // Change prefix in the cache
      client.guildInfo.set(message.guild.id, data);

      return message.channel.send(`De prefix is succesvol veranderd naar \`${newPrefix}\`.`);
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van de prefix.', error);
      return message.channel.send('Er is een fout opgetreden bij het bewerken van de prefix.');
    }
  },
};