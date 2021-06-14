const mongoose = require('mongoose');
const { prefix } = require('../config.json');

const guildSchema = new mongoose.Schema({
  // Guild ID
  _id: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: prefix,
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

module.exports = mongoose.model('guilds', guildSchema);