const { GuildDoc, guildModel } = require('../../models/guildModel');
const { ICommand } = require('../../structures/ICommand');
const { getChannel, updateCronjob } = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'kanaal',
  aliases: ['channel'],
  description: 'Verander het kanaal waarin de bot de succes-berichten stuurt.',
  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: ['kanaal'],
  syntaxError: 'Voer het ID of naam in van het kanaal waarin je de berichten wilt versturen.',
  examples: ['kanaal 838084030062264320', 'kanaal #algemeen'],

  async execute(client, message, args) {
    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: message.guild.id });
    const newChannel = getChannel(message.guild, args[0]);

    // Check if the provided channel is a valid text channel and that the bot has permissions to send messages in it.
    if (!data) return;
    if (!newChannel) return ['reply', 'Dat is geen geldig kanaal.'];
    if (!newChannel.isText()) return ['reply', 'Dat is geen geldig tekstkanaal.'];
    // @ts-ignore
    if (!newChannel.permissionsFor(client.user)?.has('VIEW_CHANNEL')) return ['reply', 'Ik kan dat kanaal niet bekijken.'];
    // @ts-ignore
    if (!newChannel.permissionsFor(client.user)?.has('SEND_MESSAGES')) return ['reply', 'Ik kan geen berichten sturen in dat kanaal.'];

    // Check if the bot already uses that channel
    if (data.examChannel === newChannel.id) return ['reply', 'Dat kanaal gebruik ik nu al.'];

    try {
      // Change examChannel in the database
      data.examChannel = newChannel.id;
      await data.save();

      // Start a new cronjob
      updateCronjob(client, message.guild.id, data);

      return ['send', `Het kanaal is succesvol veranderd naar ${newChannel.toString()}.`];
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van een kanaal in de database.', error);
      return ['send', 'Er is een fout opgetreden bij het bewerken van een kanaal in de database.'];
    }
  },
};