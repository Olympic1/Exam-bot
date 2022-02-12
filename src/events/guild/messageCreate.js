const { Message, PermissionString, Util } = require('discord.js');
const { GuildDoc, guildModel } = require('../../models/guildModel');
const { ProfileDoc, profileModel } = require('../../models/profileModel');
const { IEvent } = require('../../structures/IEvent');
const { formatToDuration } = require('../../utils/functions');

/** @type {IEvent} */
module.exports = {
  name: 'messageCreate',

  /** @param {Message<true>} message */
  async execute(client, message) {
    if (!client.application?.owner) await client.application?.fetch();

    // Check if the message was sent by an user inside a server
    if (message.author.bot || !message.guild) return;

    // Get the prefix from our database
    /** @type {GuildDoc} */
    const data = await guildModel.findOne({ _id: message.guild.id });
    const prefix = data?.prefix || '$';

    // Check if the command begins with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Search the user in our database. If we didn't find the user, create a profile for him.
    /** @type {ProfileDoc} */
    let profileData;
    try {
      profileData = await profileModel.findOne({ _id: message.author.id }) ?? await profileModel.create({ _id: message.author.id });
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het toevoegen van een gebruiker aan de database.', error);
      return message.channel.send('Er is iets fout gegaan. Voer uw commando opnieuw in.');
    }

    // Remove the prefix and put the arguments into an array
    const args = message.content.slice(prefix.length).trim().split(/ +/);

    // Get the command name and remove it from the array
    const firstElement = args.shift();
    if (!firstElement) return;

    // Ensure that the name is lower case
    const commandName = firstElement.toLowerCase();

    // Get the command via its name or alias
    const command = client.commands.get(commandName) || client.aliases.get(commandName);

    // Check if the command or alias exist
    if (!command) return message.reply(`Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

    // Check if the command is only a slash command
    if (command.slash === true) return message.reply(`Dit is enkel een slash-commando. Gebruik \`/${command.name}\` om dit commando uit te voeren.`);

    // If the command is only for the bot owner, check if the user is the owner
    const isBotOwner = message.author.id === client.application?.owner?.id;
    if (command.ownerOnly && !isBotOwner) return message.reply('Dit commando kan enkel worden uitgevoerd door de bot eigenaar.');

    // Check if the command has permissions
    if (command.permissions?.length) {
      /** @type {PermissionString[]} */
      const invalidUserPerms = [];
      /** @type {PermissionString[]} */
      const invalidBotPerms = [];

      for (const perm of command.permissions) {
        // Check if user has the correct permissions
        if (!message.member?.permissions.has(perm)) invalidUserPerms.push(perm);

        // Check if the bot has the correct permissions with exception to 'ADMINISTRATOR'
        if (perm !== 'ADMINISTRATOR' && !message.guild.me?.permissions.has(perm)) invalidBotPerms.push(perm);
      }

      // Send a message if the user lacks a permission
      if (invalidUserPerms.length) return message.reply(`Je mist de volgende permissies: \`${invalidUserPerms}\`.`);

      // Send a message if the bot lacks a permission
      if (invalidBotPerms.length) return message.channel.send(`Ik mis de volgende permissies: \`${invalidBotPerms}\`. Neem contact op met de serverbeheerders.`);
    }

    // Check if the user provided too few arguments
    if (command.minArgs !== undefined && args.length < command.minArgs) {
      return message.reply(`Je hebt te weinig argumenten ingegeven! ${command.syntaxError}`);
    }

    // Check if the user provided too many arguments
    if (args.length > command.maxArgs) {
      let msg = 'Je hebt te veel argumenten ingegeven! Dit commando accepteert ';
      msg += command.maxArgs === 0 ? 'geen argumenten.' : `maximaal ${command.maxArgs} argument${command.maxArgs > 1 ? 'en' : ''}.`;
      return message.reply(msg);
    }

    // Check if the command has a cooldown
    if (command.cooldown) {
      const cooldown = profileData.cooldowns.find(cd => cd.guildId === message.guild.id && cd.name === command.name);

      // Check if the user already has a cooldown for this command
      if (cooldown) {
        const left = command.cooldown * 1000 - (Date.now() - new Date(cooldown.date).getTime());

        // Check if the command is still on cooldown
        if (left > 0) {
          const seconds = Math.ceil(left / 1000);
          const time = formatToDuration(seconds);
          return message.reply(`Je moet nog ${time} wachten voordat je dit commando opnieuw kunt gebruiken.`);
        }

        // Remove the expired cooldown for the user
        await profileModel.findOneAndUpdate(
          {
            _id: message.author.id,
          },
          {
            $pull: {
              cooldowns: {
                guildId: message.guild.id,
                name: command.name,
              },
            },
          },
        );
      }

      // Add a cooldown for the user
      await profileModel.findOneAndUpdate(
        {
          _id: message.author.id,
        },
        {
          $push: {
            cooldowns: {
              guildId: message.guild.id,
              name: command.name,
              date: Date.now(),
            },
          },
        },
      );
    }

    try {
      // Execute the command
      const result = await command.execute(client, message, args);

      // Check if we need to reply or just send a message
      if (result[0] === 'reply') {
        const msg = Util.splitMessage(result[1], { char: ', ' });
        msg.forEach(m => message.reply({ content: m }));
        return;
      }

      if (result[0] === 'send') {
        const msg = Util.splitMessage(result[1], { char: ', ' });
        msg.forEach(m => message.channel.send({ content: m }));
        return;
      }

      if (result[0] === 'embed') return message.channel.send({ embeds: [result[1]] });

      // No valid return statement
      return message.channel.send(`Geen geldige return statement. Neem contact op met <@${client.application?.owner?.id}>.`);
    } catch (error) {
      client.log.error(`Er is een fout opgetreden bij het uitvoeren van het commando '${command.name}'.`, error);
      message.channel.send(`Er is een fout opgetreden bij het uitvoeren van dat commando! Neem contact op met <@${client.application?.owner?.id}>.`);
      throw error;
    }
  },
};