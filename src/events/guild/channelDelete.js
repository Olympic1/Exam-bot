const { GuildChannel } = require('discord.js');
const { BotClient } = require('../../typings');
const guildModel = require('../../models/guildModel');
const utils = require('../../utils/functions');

/**
 * @param {BotClient} client
 * @param {GuildChannel} channel
 */
module.exports = async (client, channel) => {
  let data = client.guildInfo.get(channel.guild.id);

  // Check if the deleted channel was the one we send messages in
  if (channel.id !== data.examChannel) return;

  try {
    // Change examChannel in the database
    data = await guildModel.findOneAndUpdate(
      {
        _id: channel.guild.id,
      },
      {
        examChannel: '',
      },
      {
        new: true,
      },
    );

    // Start cronjob and cache the guild data
    utils.updateCronjob(client, channel.guild.id, data);
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het aanpassen van een database profiel voor een server.', error);
  }

  // Message the guild owner that the deleted channel was needed for the bot
  return channel.guild.owner.send(`Het kanaal \`${channel.name}\` in \`${channel.guild}\` dat ik gebruik om berichten in te versturen, is zojuist verwijderd. Gelieve het commando \`${data.prefix}kanaal\` uit te voeren om mij een nieuw kanaal toe te wijzen.`);
};