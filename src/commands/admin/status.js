const { ICommand } = require('../../typings');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'status',
  aliases: [],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  info: {
    description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'',
    usage: 'status <activiteit>',
    examples: ['status Marathonradio'],
  },
  async execute(message, args, client) {
    if (!args.length) return message.reply('Voer de status in die u wilt instellen voor de bot.');

    // Set the bot's new status
    const content = args.join(' ');
    utils.setBotStatus(client, content, 'LISTENING');

    return message.channel.send(`Mijn status is succesvol veranderd naar \`${content}\`.`);
  },
};