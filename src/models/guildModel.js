const mongoose = require('mongoose');
const config = require('../config.json');

const guildSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: config.prefix,
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

const model = mongoose.model('Guilds', guildSchema);

module.exports = model;