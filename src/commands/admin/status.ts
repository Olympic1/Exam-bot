import { ICommand } from '../../structures/ICommand';
import { setBotStatus } from '../../utils/functions';

export = {
  name: 'status',
  description: 'Stel de status van de bot in. De status begint altijd met \'Luistert naar\'.',
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  minArgs: 1,
  maxArgs: 1,
  expectedArgs: ['status'],
  syntaxError: 'Voer de status in die je wil instellen.',
  examples: ['status Marathonradio'],
  options: [
    {
      name: 'status',
      description: 'De nieuwe status voor de bot',
      type: 'STRING',
      required: true
    }
  ],

  async execute(client, message, args) {
    const newStatus = args.join(' ');

    // Check null
    if (!newStatus) return ['reply', 'Gelieve een nieuwe status in te geven.'];

    // Set the bot's new status
    setBotStatus(client, newStatus, 'LISTENING');

    return ['send', `Mijn status is succesvol veranderd naar \`${newStatus}\`.`];
  }
} as ICommand