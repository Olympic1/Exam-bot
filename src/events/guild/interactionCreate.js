const { Interaction } = require('discord.js');
const { BotClient } = require('../../typings');
const profileModel = require('../../models/profileModel');
const utils = require('../../utils/functions');

/**
 * @param {BotClient} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!client.application?.owner) await client.application?.fetch();

  // Check if the interaction is a slash command
  if (!interaction.isCommand()) return;

  // Check if the user already has a profile in our database
  let profileData;
  try {
    // Search the user in our database. If we didn't find the user, create a profile for him.
    profileData = await profileModel.findOne({ _id: interaction.user.id }) ?? await profileModel.create({
      _id: interaction.user.id,
      cooldowns: [],
      exams: [],
    });
  } catch (error) {
    client.log.error('Er is een fout opgetreden bij het aanmaken van een database profiel voor een bestaande gebruiker.', error);
    return interaction.reply({ content: 'Er is iets fout gegaan. Voer uw commando opnieuw in.', ephemeral: true });
  }

  // Get the slash command
  const commandName = interaction.commandName;
  const command = client.commands.get(commandName);

  // If the command is only for the bot owner, check if the user is the owner
  const isBotOwner = interaction.user.id === client.application.owner.id;
  if (command.ownerOnly && !isBotOwner) return interaction.reply({ content: 'Dit commando kan enkel worden uitgevoerd door de bot eigenaar.', ephemeral: true });

  // Check if the command has permissions
  if (command.permissions.length) {
    const invalidUserPerms = [];
    const invalidBotPerms = [];

    for (const perm of command.permissions) {
      // Check if user has the correct permissions, unless it's the owner
      if (!isBotOwner && !interaction.memberPermissions.has(perm)) invalidUserPerms.push(perm);

      // Check if the bot has the correct permissions with exception to 'ADMINISTRATOR'
      if (perm !== 'ADMINISTRATOR' && !interaction.guild.me.permissions.has(perm)) invalidBotPerms.push(perm);
    }

    // Send a message if the user lacks a permission
    if (invalidUserPerms.length) return interaction.reply({ content: `Je mist de volgende permissies: \`${invalidUserPerms}\`.`, ephemeral: true });

    // Send a message if the bot lacks a permission
    if (invalidBotPerms.length) return interaction.reply({ content: `Ik mis de volgende permissies: \`${invalidBotPerms}\`. Neem contact op met de serverbeheerders.`, ephemeral: true });
  }

  // Check if the command has a cooldown
  if (command.cooldown) {
    const cooldown = profileData.cooldowns.find(cd => cd.guildId === interaction.guild.id && cd.name === command.name);

    // Check if the user already has a cooldown for this command
    if (cooldown) {
      const left = command.cooldown * 1000 - (Date.now() - cooldown.time);

      // Check if the command is still on cooldown
      if (left > 0) {
        const seconds = Math.ceil(left / 1000);
        const time = utils.formatToTime(seconds);
        return interaction.reply({ content: `Je moet nog ${time} wachten voordat je dit commando opnieuw kunt gebruiken.`, ephemeral: true });
      }

      // Remove the expired cooldown for the user
      await profileModel.findOneAndUpdate(
        {
          _id: interaction.user.id,
        },
        {
          $pull: {
            cooldowns: {
              guildId: interaction.guild.id,
              name: command.name,
            },
          },
        },
      );
    }

    // Add a cooldown for the user
    await profileModel.findOneAndUpdate(
      {
        _id: interaction.user.id,
      },
      {
        $push: {
          cooldowns: {
            guildId: interaction.guild.id,
            name: command.name,
            time: Date.now(),
          },
        },
      },
    );
  }

  // Get all the options
  const args = [];
  if (interaction.options) {
    for (const option of interaction.options.data) {
      args.push(option.value.toString());
    }
  }
  try {
    // Execute the command
    const result = await command.execute(interaction, args, client);

    // Check if the command doesn't return anything (ex: restart)
    if (!result) return interaction.reply({ content: 'Commando uitgevoerd.', ephemeral: true });

    // Slash commands can only reply, so 'send' needs to be replied too
    if (result[0] === 'send' || result[0] === 'reply') {
      // If the message is under 2000 characters, send it
      if (result[1].length <= 2000) return interaction.reply({ content: result[1], ephemeral: true });

      // Split the message
      const splitArr = result[1].split(', ');
      let firstMsg = '';
      let secondMsg = '';

      // Construct the message again
      for (const str of splitArr) {
        // Check if the next addition will exceed 2000 characters
        if ((firstMsg + str).length < 2000) {
          firstMsg += str;
          continue;
        }

        secondMsg += str;
      }

      // Return the messages
      await interaction.reply({ content: firstMsg, ephemeral: true });
      return interaction.followUp({ content: secondMsg, ephemeral: true });
    }

    if (result[0] === 'embed') return interaction.reply({ embeds: [result[1]], ephemeral: true });

    // No valid return statement
    return interaction.reply({ content: `Geen geldige return statement. Neem contact op met <@${client.application.owner.id}>.`, ephemeral: true });
  } catch (error) {
    client.log.error(`Er is een fout opgetreden bij het uitvoeren van het commando '${command.name}'.`, error);
    interaction.reply({ content: `Er is een fout opgetreden bij het uitvoeren van dat commando! Neem contact op met <@${client.application.owner.id}>.`, ephemeral: true });
    throw error;
  }
};