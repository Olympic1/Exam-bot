const { CronJob } = require('cron');
const { Snowflake } = require('discord.js');
const { Document, Model, model, Schema } = require('mongoose');

/**
 * @typedef IGuild
 * @property {Snowflake} _id
 * @property {string} name
 * @property {string} prefix
 * @property {Snowflake} examChannel
 * @property {string} cronTimer
 * @property {CronJob} job
 */

/**
 * @typedef {IGuild & Document} GuildDoc
 */

/** @type {Schema<GuildDoc>} */
const guildSchema = new Schema({
  // Guild ID
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: '$',
  },
  examChannel: {
    type: String,
    default: '',
  },
  cronTimer: {
    type: String,
    default: '0 8 * * 1-5',
  },
});

/** @type {Model<GuildDoc>} */
module.exports.guildModel = model('guilds', guildSchema);