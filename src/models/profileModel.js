const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
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

const model = mongoose.model('Profiles', profileSchema);

module.exports = model;