const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // User ID
  _id: {
    type: String,
    required: true,
  },
  cooldowns: [
    {
      guildId: String,
      name: String,
      time: Date,
    },
  ],
  exams: [
    {
      guildId: String,
      name: String,
      date: Date,
    },
  ],
});

module.exports = mongoose.model('profiles', profileSchema);