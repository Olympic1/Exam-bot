const { Interaction, PermissionString, Util } = require('discord.js');
const { ProfileDoc, profileModel } = require('../../models/profileModel');
const { IEvent } = require('../../structures/IEvent');
const { formatToDuration } = require('../../utils/functions');

/** @type {IEvent} */
module.exports = {
  name: 'interactionCreate',

  /** @param {Interaction<'cached'>} interaction */
  async execute(client, interaction) {
    if (!client.application?.owner) await client.application?.fetch();

    // Check if the interaction was sent by an user inside a server
    if (interaction.user.bot || !interaction.guild) return;

    // Check if the interaction is a slash command
    if (!interaction.isCommand()) return;

    // Search the user in our database. If we didn't find the user, create a profile for him.
    /** @type {ProfileDoc} */
    let profileData;
    try {
      profileData = await profileModel.findOne({ _id: interaction.user.id }) ?? await profileModel.create({ _id: interaction.user.id });
    } catch (error) {
      client.log.error('Er is een fout opgetreden bij het toevoegen van een gebruiker aan de database.', error);
      return interaction.reply({ content: 'Er is iets fout gegaan. Voer uw commando opnieuw in.', ephemeral: true });
    }

    // Get the slash command
    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);

    // Check if the command exist
    if (!command) return interaction.reply({ content: `Er is geen commando met de naam \`${commandName}\`. Typ \`/help\` voor meer informatie over mijn commando's.`, ephemeral: true });

    // If the command is only for the bot owner, check if the user is the owner
    const isBotOwner = interaction.user.id === client.application?.owner?.id;
    if (command.ownerOnly && !isBotOwner) return interaction.reply({ content: 'Dit commando kan enkel worden uitgevoerd door de bot eigenaar.', ephemeral: true });

    // Check if the command has permissions
    if (command.permissions?.length) {
      /** @type {PermissionString[]} */
      const invalidUserPerms = [];
      /** @type {PermissionString[]} */
      const invalidBotPerms = [];

      for (const perm of command.permissions) {
        // Check if user has the correct permissions
        if (!interaction.memberPermissions.has(perm)) invalidUserPerms.push(perm);

        // Check if the bot has the correct permissions with exception to 'ADMINISTRATOR'
        if (perm !== 'ADMINISTRATOR' && !interaction.guild.me?.permissions.has(perm)) invalidBotPerms.push(perm);
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
        const left = command.cooldown * 1000 - (Date.now() - new Date(cooldown.date).getTime());

        // Check if the command is still on cooldown
        if (left > 0) {
          const seconds = Math.ceil(left / 1000);
          const time = formatToDuration(seconds);
          return interaction.reply({ content: `Je moet nog ${time} wachten voordat je dit commando opnieuw kunt gebruiken.`, ephemeral: true });
        }

        // Remove the expired cooldown for the user
        profileData.cooldowns = profileData.cooldowns.filter(cd => cd.guildId !== interaction.guild.id || cd.name !== command.name);
        await profileData.save();
      }

      // Add a cooldown for the user
      profileData.cooldowns.push({
        guildId: interaction.guild.id,
        name: command.name,
        date: new Date(Date.now()),
      });

      await profileData.save();
    }

    // Get all the options
    /** @type {string[]} */
    const args = [];
    if (interaction.options) {
      interaction.options.data.forEach(({ value }) => {
        args.push(String(value));
      });
    }

    try {
      // Execute the command
      const result = await command.execute(client, interaction, args);

      // Slash commands can only reply, so 'send' needs to be replied too
      if (result[0] === ('send' || 'reply')) {
        const msg = Util.splitMessage(result[1], { char: ', ' });
        msg.forEach(m => interaction.reply({ content: m, ephemeral: true }));
        return;
      }

      if (result[0] === 'embed') return interaction.reply({ embeds: [result[1]], ephemeral: true });

      // No valid return statement
      return interaction.reply({ content: `Geen geldige return statement. Neem contact op met <@${client.application?.owner?.id}>.`, ephemeral: true });
    } catch (error) {
      client.log.error(`Er is een fout opgetreden bij het uitvoeren van het commando '${command.name}'.`, error);
      interaction.reply({ content: `Er is een fout opgetreden bij het uitvoeren van dat commando! Neem contact op met <@${client.application?.owner?.id}>.`, ephemeral: true });
      throw error;
    }
  },
};