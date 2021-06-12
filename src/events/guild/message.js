const { Message } = require('discord.js');
const { BotClient } = require('../../typings');
const profileModel = require('../../models/profileModel');
const utils = require('../../utils/functions');

/**
 * @param {BotClient} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  if (!client.application?.owner) await client.application?.fetch();

  // Check if the message was sent by a user inside a server
  if (message.author.bot || !message.guild) return;

  // Get the prefix from our cache
  const prefix = client.guildInfo.get(message.guild.id).prefix;

  // Check if the command begins with the prefix
  if (!message.content.startsWith(prefix)) return;

  // Check if the user already has a profile in our database
  let profileData;
  try {
    // Search the user in our database. If we didn't find the user, create a profile for him.
    profileData = await profileModel.findOne({ _id: message.author.id }) ?? await profileModel.create({
      _id: message.author.id,
      cooldowns: [],
      exams: [],
    });
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het aanmaken van een database profiel voor een bestaande gebruiker.', error);
    return message.channel.send('Er is iets fout gegaan. Voer uw commando opnieuw in.');
  }

  // Remove the prefix and put the arguments into an array
  const args = message.content.slice(prefix.length).split(/ +/);

  // Don't allow a space after the prefix
  if (args[0] === '') return message.reply(`Plaats geen spatie na de \`${prefix}\`.`);

  // Get the command name and remove it from the array
  const commandName = args.shift().toLowerCase();

  // Get the command via its name or alias
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  // Check if the command or alias exist
  if (!command) return message.reply(`Er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

  // If the command is only for the bot owner, check if the user is the owner
  const isBotOwner = message.author.id === client.application.owner.id;
  if (command.ownerOnly && !isBotOwner) return message.reply('Dit commando kan enkel worden uitgevoerd door de bot eigenaar.');

  // Check if the command has permissions
  if (command.permissions.length) {
    const invalidUserPerms = [];
    const invalidBotPerms = [];

    for (const perm of command.permissions) {
      // Check if user has the correct permissions, unless it's the owner
      if (!isBotOwner && !message.member.permissions.has(perm)) invalidUserPerms.push(perm);

      // Check if the bot has the correct permissions with exception to 'ADMINISTRATOR'
      if (perm !== 'ADMINISTRATOR' && !message.guild.me.permissions.has(perm)) invalidBotPerms.push(perm);
    }

    // Send a message if the user lacks a permission
    if (invalidUserPerms.length) return message.reply(`Je mist de volgende permissies: \`${invalidUserPerms}\`.`);

    // Send a message if the bot lacks a permission
    if (invalidBotPerms.length) return message.channel.send(`Ik mis de volgende permissies: \`${invalidBotPerms}\`. Neem contact op met de serverbeheerders.`);
  }

  // Check if the command has a cooldown
  if (command.cooldown) {
    const cooldown = profileData.cooldowns.find(cd => cd.guildId === message.guild.id && cd.name === command.name);

    // Check if the user already has a cooldown for this command
    if (cooldown) {
      const left = command.cooldown * 1000 - (Date.now() - cooldown.time);

      // Check if the command is still on cooldown
      if (left > 0) {
        const seconds = Math.ceil(left / 1000);
        const time = utils.formatToTime(seconds);
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
            time: Date.now(),
          },
        },
      },
    );
  }

  // Execute the command
  try {
    command.execute(message, args, client);
  } catch (error) {
    client.log.error(`Er is een fout opgetreden bij het uitvoeren van het commando '${command.name}'.`, error);
    message.channel.send(`Er is een fout opgetreden bij het uitvoeren van dat commando! Neem contact op met <@${client.application.owner.id}>.`);
    throw error;
  }
};