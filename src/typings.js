const { CronJob } = require('cron');
const { Client, Collection, CommandInteraction, Message, MessageEmbed, PermissionString, Snowflake } = require('discord.js');
const { Logger } = require('winston');

/**
 * @typedef ICommand
 * @property {string} name
 * @property {string[]} [aliases]
 * @property {string} [description]
 * @property {number} [cooldown]
 * @property {PermissionString[]} [permissions]
 * @property {boolean} [ownerOnly]
 * @property {boolean | 'both'} [slash]
 * @property {ICommandInfo} [info]
 * @property {execute} execute
 */

/**
 * @typedef ICommandInfo
 * @property {string} [category]
 * @property {number} [minArgs]
 * @property {number} [maxArgs]
 * @property {string} [expectedArgs]
 * @property {string} [syntaxError]
 * @property {string[]} [examples]
 */

/**
 * @callback execute
 * @param {Message | CommandInteraction} message
 * @param {string[]} args
 * @param {BotClient} client
 * @returns {['send' | 'reply', string] | ['embed', MessageEmbed]}
 */

/**
 * @typedef IGuild
 * @property {Snowflake} _id
 * @property {string} prefix
 * @property {Snowflake} examChannel
 * @property {string} cronTimer
 * @property {CronJob} [job]
 */

/**
 * @typedef ExtendedClient
 * @property {Collection<string, ICommand>} [commands]
 * @property {Collection<Snowflake, IGuild>} [guildInfo]
 * @property {Logger} [log]
 */

/**
 * @typedef {Client & ExtendedClient} BotClient
 */