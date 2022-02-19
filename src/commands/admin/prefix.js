const { GuildDoc, guildModel } = require('../../models/guildModel');
const { ICommand } = require('../../structures/ICommand');

/** @type {ICommand} */
module.exports = {
  name: 'prefix',
  description: 'Verander de prefix van de bot.',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: ['prefix'],
  syntaxError: 'Voer de prefix in die je wilt gebruiken.',
  examples: ['prefix ?', 'prefix -'],
  options: [
    {
      name: 'prefix',
      description: 'De nieuwe prefix voor de commando\'s',
      type: 'STRING',
      required: true,
    },
  ],

  async execute(client, message, args) {
    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: message.guild.id });
    const newPrefix = args[0];

    // Check null
    if (!data) return;
    if (!newPrefix) return ['reply', 'Gelieve een nieuwe prefix in te geven.'];

    // Check if the provided prefix is already used for the bot
    if (data.prefix === newPrefix) return ['reply', 'Die prefix gebruik ik nu al.'];

    try {
      // Update prefix
      data.prefix = newPrefix;
      await data.save();

      return ['send', `De prefix is succesvol veranderd naar \`${newPrefix}\`.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van een prefix in de database.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van een prefix in de database.'];
    }
  },
};