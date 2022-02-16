const Heroku = require('heroku-client');
const { ICommand } = require('../../structures/ICommand');

/** @type {ICommand} */
module.exports = {
  name: 'herstart',
  aliases: ['restart'],
  description: 'Herstart de bot.',
  cooldown: 300,
  permissions: ['ADMINISTRATOR'],
  ownerOnly: true,
  slash: 'both',
  maxArgs: 0,
  examples: ['herstart'],

  async execute(client, message, args) {
    // Validate environment variable
    if (!process.env.HEROKU_OAUTH) return ['reply', 'De Heroku authenticatie token ontbreekt.'];

    // Logs channel
    const channel = client.channels.cache.get('934494331627253760');

    // Check if the channel is found and if it's a text channel
    if (!channel?.isText()) return;

    await channel.send('Opnieuw opstarten...');

    // Restart the dyno's on Heroku
    const heroku = new Heroku({ token: process.env.HEROKU_OAUTH });
    await heroku.delete('/apps/mnm-examen-bot/dynos');

    return ['reply', 'Commando uitgevoerd.'];
  },
};