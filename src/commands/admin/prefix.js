const { ICommand } = require('../../typings');
const guildModel = require('../../models/guildModel');

/** @type {ICommand} */
module.exports = {
  name: 'prefix',
  aliases: [],
  description: 'Verander de prefix van de bot.',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  info: {
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<prefix>',
    syntaxError: 'Voer de prefix in die je wilt gebruiken.',
    examples: ['prefix ?', 'prefix -'],
  },
  async execute(message, args, client) {
    let data = client.guildInfo.get(message.guild.id);
    const newPrefix = args[0];

    // Check if the provided prefix is already used for the bot
    if (data.prefix === newPrefix) return ['reply', 'Die prefix gebruik ik nu al.'];

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

      return ['send', `De prefix is succesvol veranderd naar \`${newPrefix}\`.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van de prefix.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van de prefix.'];
    }
  },
};