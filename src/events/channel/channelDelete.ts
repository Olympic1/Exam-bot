import { DMChannel, NonThreadGuildBasedChannel } from 'discord.js';
import { guildModel } from '../../models/guildModel';
import { IEvent } from '../../structures/IEvent';
import { updateCronjob } from '../../utils/functions';

export = {
  name: 'channelDelete',

  async execute(client, channel: DMChannel | NonThreadGuildBasedChannel) {
    try {
      if (channel.type === 'DM') return;

      const data = await guildModel.findOne({ _id: channel.guild.id });

      // Check if the deleted channel was the one we send messages in
      if (!data || channel.id !== data.examChannel) return;

      // Change examChannel in the database
      data.examChannel = '';
      await data.save();

      // Update the cronjob
      updateCronjob(client, channel.guild.id, data);

      // Message the guild owner that the deleted channel was needed for the bot
      const guildOwner = await channel.guild.fetchOwner();
      guildOwner.send(`Het kanaal \`${channel.name}\` in \`${channel.guild}\` dat ik gebruik om berichten in te versturen, is zojuist verwijderd. Gelieve het commando \`${data.prefix}kanaal\` uit te voeren om mij een nieuw kanaal toe te wijzen.`);
    } catch (error) {
      client.logger.error('Er is een fout opgetreden bij het verwijderen van een kanaal uit de database.', error);
    }
  }
} as IEvent