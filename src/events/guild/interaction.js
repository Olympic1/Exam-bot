const { APIMessage, Interaction, MessageEmbed } = require('discord.js');
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

  // Return if the command doesn't return anything (ex: restart)
  if (!result) return interaction.reply('Succes');

  // Slash commands can only reply, so 'send' needs to be replied too
  if (result[0] === 'send' || result[0] === 'reply') return interaction.reply(result[1]);

  // Handle embeds
  if (typeof result === 'object') {
    const embed = new MessageEmbed(result);
    const msg = await APIMessage.create(interaction.channel, { embeds: [embed] })
      .resolveData()
      .resolveFiles();

    return interaction.reply(msg);
  }

  // Need to return something to prevent errors
  return interaction.reply('Succes');
};