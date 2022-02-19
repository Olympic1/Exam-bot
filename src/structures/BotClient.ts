import { CronJob } from 'cron';
import { Client, ClientOptions, Collection } from 'discord.js';
import { logger } from '../utils/logger';
import { ICommand } from './ICommand';

export interface IClient {
  commands: Collection<string, ICommand>
  aliases: Collection<string, ICommand>
  cronJobs: Collection<string, CronJob>
  logger: typeof logger
}

export class BotClient<Ready extends boolean = boolean> extends Client<Ready> implements IClient {
  commands: Collection<string, ICommand>;
  aliases: Collection<string, ICommand>;
  cronJobs: Collection<string, CronJob>;
  logger: typeof logger;

  constructor(options: ClientOptions) {
    // Pass options over to Client
    super(options);

    // Initialize properties
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cronJobs = new Collection();

    this.logger = logger;
  }
}