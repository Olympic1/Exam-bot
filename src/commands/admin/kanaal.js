const guildModel = require('../../models/guildModel');

module.exports = {
  name: 'kanaal',
  aliases: ['channel'],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander het kanaal waarin de bot de succes-berichten stuurt.',
    usage: 'kanaal <kanaal>',
    examples: ['kanaal 838084030062264320', 'kanaal #algemeen'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('voer het ID of naam in van het kanaal waarin u de berichten wilt versturen.');

    let data = client.guildInfo.get(message.guild.id);
    const newChannel = client.utils.getChannel(message.guild, args[0]);

    if (!newChannel) return message.reply('dat is geen geldig kanaal.');
    if (!newChannel.isText()) return message.reply('dat is geen geldig tekstkanaal.');
    if (!newChannel.permissionsFor(client.user.id).has('VIEW_CHANNEL')) return message.reply('ik kan dat kanaal niet bekijken.');
    if (!newChannel.permissionsFor(client.user.id).has('SEND_MESSAGES')) return message.reply('ik kan geen berichten sturen in dat kanaal.');
    if (data.examChannel === newChannel.id) return message.reply('dat kanaal gebruik ik nu al.');

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
      client.utils.updateCronjob(client, message.guild.id, data);

      return message.channel.send(`Het kanaal is succesvol veranderd naar ${newChannel.toString()}.`);
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het bewerken van het kanaal.', error);
      return message.channel.send('Er is een fout opgetreden bij het bewerken van het kanaal.');
    }
  },
};