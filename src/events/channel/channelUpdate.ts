import { DMChannel, NonThreadGuildBasedChannel } from 'discord.js';
import { guildModel } from '../../models/guildModel';
import { IEvent } from '../../structures/IEvent';

export = {
  name: 'channelUpdate',

  async execute(client, oldChannel: DMChannel | NonThreadGuildBasedChannel, newChannel: DMChannel | NonThreadGuildBasedChannel) {
    try {
      if (oldChannel.type === 'DM' || newChannel.type === 'DM') return;

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
      client.logger.error('Er is een fout opgetreden bij het bewerken van een kanaal in de database.', error);
    }
  }
} as IEvent