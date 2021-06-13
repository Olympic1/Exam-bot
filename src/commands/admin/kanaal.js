const { ICommand } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'kanaal',
  aliases: ['channel'],
  description: 'Verander het kanaal waarin de bot de succes-berichten stuurt.',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  info: {
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<kanaal>',
    syntaxError: 'Voer het ID of naam in van het kanaal waarin je de berichten wilt versturen.',
    examples: ['kanaal 838084030062264320', 'kanaal #algemeen'],
  },
  async execute(message, args, client) {
    let data = client.guildInfo.get(message.guild.id);
    const newChannel = utils.getChannel(message.guild, args[0]);

    if (!newChannel) return ['reply', 'Dat is geen geldig kanaal.'];
    if (!newChannel.isText()) return ['reply', 'Dat is geen geldig tekstkanaal.'];
    if (!newChannel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return ['reply', 'Ik kan dat kanaal niet bekijken.'];
    if (!newChannel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return ['reply', 'Ik kan geen berichten sturen in dat kanaal.'];
    if (data.examChannel === newChannel.id) return ['reply', 'Dat kanaal gebruik ik nu al.'];

    try {
      // Change examChannel in the database
      data = await guildModel.findOneAndUpdate(
        {
          _id: message.guild.id,
        },
        {
          examChannel: newChannel.id,
        },
        {
          new: true,
        },
      );

      // Start cronjob and cache the guild data
      utils.updateCronjob(client, message.guild.id, data);

      return ['send', `Het kanaal is succesvol veranderd naar ${newChannel.toString()}.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van het kanaal.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van het kanaal.'];
    }
  },
};