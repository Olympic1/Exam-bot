const { ApplicationCommandOptionData, CommandInteraction, Message, MessageEmbed, PermissionString } = require('discord.js');
const BotClient = require('./BotClient');

/**
 * @typedef ICommand
 * @property {string} name
 * @property {string[]} [aliases]
 * @property {string} [description]
 * @property {number} [cooldown]
 * @property {PermissionString[]} [permissions]
 * @property {boolean} [ownerOnly]
 * @property {boolean | 'both'} [slash]
 * @property {string} [category]
 * @property {number} [minArgs]
 * @property {number} maxArgs
 * @property {string[]} [expectedArgs]
 * @property {string} [syntaxError]
 * @property {string[]} [examples]
 * @property {ApplicationCommandOptionData[]} [options]
 * @property {ICallback} execute
 */

/**
 * @callback ICallback
 * @param {BotClient} client
 * @param {Message<true> | CommandInteraction<'cached'>} message
 * @param {string[]} args
 * @returns {Promise<['send' | 'reply', string] | ['embed', MessageEmbed]>}
 */