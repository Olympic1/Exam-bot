const { Interaction } = require('discord.js');
const { BotClient } = require('../../typings');

/**
 * @param {BotClient} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!client.application?.owner) await client.application?.fetch();

  // Check if the interaction is a slash command
  if (!interaction.isCommand()) return console.log('Not a slash command.');

  // Get the slash command
  const commandName = interaction.commandName;
  const command = client.commands.get(commandName);

  // Check if the command exists
  if (!command || !command.execute) return console.log('No command found, or command doesn\'t have a execution.');

  // Get all the options
  const args = [];
  if (interaction.options) {
    for (const option of interaction.options) {
      args.push(option[1].value.toString());
    }
  }

  // Execute the command
  const result = await command.execute(interaction, args, client);

  // Check if the command doesn't return anything (ex: restart)
  if (!result) return interaction.reply({ content: 'Commando uitgevoerd.', ephemeral: true });

  // Slash commands can only reply, so 'send' needs to be replied too
  if (result[0] === 'send' || result[0] === 'reply') {
    // If the message is under 2000 characters, send it
    if (result[1].length <= 2000) return interaction.reply({ content: result[1] });

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
    await interaction.reply({ content: firstMsg });
    return interaction.followUp({ content: secondMsg });
  }
  if (result[0] === 'embed') return interaction.reply({ embeds: [result[1]] });

  // No valid return statement
  return interaction.reply({ content: `Geen geldige return statement. Neem contact op met <@${client.application.owner.id}>.`, ephemeral: true });
};