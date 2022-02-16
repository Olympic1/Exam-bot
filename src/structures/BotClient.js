const { CronJob } = require('cron');
const { Client, ClientOptions, Collection } = require('discord.js');
const { logger } = require('../utils/logger');
const { ICommand } = require('./ICommand');

/**
 * @typedef IClient
 * @property {Collection<string, ICommand>} commands
 * @property {Collection<string, ICommand>} aliases
 * @property {Collection<string, CronJob>} cronJobs
 * @property {typeof logger} log
 */

/**
 * @extends Client
 * @implements {IClient}
 */
module.exports = class BotClient extends Client {
  /** @type {Collection<string, ICommand>} */
  commands;
  /** @type {Collection<string, ICommand>} */
  aliases;
  /** @type {Collection<string, CronJob>} */
  cronJobs;
  /** @type {typeof logger} */
  log;

  /** @param {ClientOptions} options */
  constructor(options) {
    // Pass options over to Client
    super(options);

    // Initialize properties
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cronJobs = new Collection();

    this.log = logger;
  }
};