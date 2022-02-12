const BotClient = require('./BotClient');

/**
 * @typedef IHandler
 * @property {(client: BotClient) => Promise<void>} execute
 */