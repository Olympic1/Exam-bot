const { GuildChannel } = require('discord.js');
const { BotClient } = require('../../typings');

/**
 * @param {BotClient} client
 * @param {GuildChannel} oldChannel
 * @param {GuildChannel} newChannel
 */
module.exports = async (client, oldChannel, newChannel) => {
  const data = client.guildInfo.get(newChannel.guild.id);

  // Check if the updated channel is the one we send messages in
  if (newChannel.id !== data.examChannel) return;

  // Check if we still have permissions in the updated channel
  const canViewChannel = newChannel.permissionsFor(client.user.id).has('VIEW_CHANNEL');
  const canSendMessages = newChannel.permissionsFor(client.user.id).has('SEND_MESSAGES');

  if (canViewChannel && canSendMessages) return;

  // Message the guild owner that the updated channel was needed for the bot
  const guildOwner = await newChannel.guild.fetchOwner();
  return guildOwner.send(`Het kanaal ${newChannel.toString()} dat ik gebruik om berichten in te versturen, is zojuist aangepast en nu kan ik hier geen berichten meer in versturen. Gelieve mij de vereiste permissies te geven of mij een nieuw kanaal toe te wijzen.`);
};