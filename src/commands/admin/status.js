const { ICommand } = require('../../structures/ICommand');
const { setBotStatus } = require('../../utils/functions');

/** @type {ICommand} */
module.exports = {
  name: 'status',
  description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'.',
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: ['activiteit'],
  syntaxError: 'Voer de status in die je wil instellen.',
  examples: ['status Marathonradio'],

  async execute(client, message, args) {
    const newStatus = args.join(' ');

    // Check null
    if (!newStatus) return ['reply', 'Gelieve een nieuwe status in te geven.'];

    // Set the bot's new status
    setBotStatus(client, newStatus, 'LISTENING');

    return ['send', `Mijn status is succesvol veranderd naar \`${newStatus}\`.`];
  },
};