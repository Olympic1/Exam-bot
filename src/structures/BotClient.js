const { CronJob } = require('cron');
const { Client, ClientOptions, Collection } = require('discord.js');
const { createLogger, format, Logger, transports } = require('winston');
const { ICommand } = require('./ICommand');

/**
 * @typedef IClient
 * @property {Collection<string, ICommand>} commands
 * @property {Collection<string, ICommand>} aliases
 * @property {Collection<string, CronJob>} cronJobs
 * @property {Logger} log
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
  /** @type {Logger} */
  log;

  /** @param {ClientOptions} options */
  constructor(options) {
    super(options);

    this.commands = new Collection();
    this.aliases = new Collection();
    this.cronJobs = new Collection();

    this.log = createLogger({
      transports: [new transports.Console({
        handleExceptions: true,
        handleRejections: true,
      })],
      format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
      exitOnError: false,
    });
  }
};