const { DMChannel, NonThreadGuildBasedChannel } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const BotClient = require('../../structures/BotClient');

/**
 * @param {BotClient} client
 * @param {DMChannel | NonThreadGuildBasedChannel} oldChannel
 * @param {DMChannel | NonThreadGuildBasedChannel} newChannel
 */
module.exports = async (client, oldChannel, newChannel) => {
  try {
    if (oldChannel.type === 'DM' || newChannel.type === 'DM') return;

    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: newChannel.guild.id });

    // Check if the updated channel is the one we send messages in
    if (!data || newChannel.id !== data.examChannel) return;

    // Check if we still have permissions in the updated channel
    const canViewChannel = newChannel.permissionsFor(client.user)?.has('VIEW_CHANNEL');
    const canSendMessages = newChannel.permissionsFor(client.user)?.has('SEND_MESSAGES');

    if (canViewChannel && canSendMessages) return;

    // Message the guild owner that the updated channel was needed for the bot
    const guildOwner = await newChannel.guild.fetchOwner();
    guildOwner.send(`Het kanaal ${newChannel.toString()} dat ik gebruik om berichten in te versturen, is zojuist aangepast en nu kan ik hier geen berichten meer in versturen. Gelieve mij de vereiste permissies te geven of mij een nieuw kanaal toe te wijzen.`);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het bewerken van een kanaal in de database.', error);
  }
};