const { Snowflake } = require('discord.js');
const { Document, Model, model, Schema } = require('mongoose');

/**
 * @typedef IProfile
 * @property {Snowflake} _id
 * @property {IRecord[]} cooldowns
 * @property {IRecord[]} exams
 */

/**
 * @typedef IRecord
 * @property {Snowflake} guildId
 * @property {string} name
 * @property {Date} date
 */

/**
 * @typedef {IProfile & Document} ProfileDoc
 */

/** @type {Schema} */
const profileSchema = new Schema({
  // User ID
  _id: {
    type: String,
    required: true,
  },
  cooldowns: {
    type: Array,
    default: [],
  },
  exams: {
    type: Array,
    default: [],
  },
});

/** @type {Model<ProfileDoc>} */
module.exports.profileModel = model('profiles', profileSchema);