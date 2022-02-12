const { ClientEvents } = require('discord.js');
const BotClient = require('./BotClient');

/**
 * @typedef IEvent
 * @property {keyof ClientEvents} name
 * @property {boolean} [once]
 * @property {IEmit} execute
 */

/**
 * @callback IEmit
 * @param {BotClient} client
 * @param {...unknown} args
 * @returns {Promise<void>}
 */