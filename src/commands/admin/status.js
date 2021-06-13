const { ICommand } = require('../../typings');
const utils = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'status',
  aliases: [],
  description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'.',
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  info: {
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: '<activiteit>',
    syntaxError: 'Voer de status in die je wilt instellen voor de bot.',
    examples: ['status Marathonradio'],
  },
  async execute(message, args, client) {
    // Set the bot's new status
    const content = args.join(' ');
    utils.setBotStatus(client, content, 'LISTENING');

    return ['send', `Mijn status is succesvol veranderd naar \`${content}\`.`];
  },
};