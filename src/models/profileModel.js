const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  serverID: { type: String, required: true },
  cooldowns: [
    {
      name: String,
      time: Date
    }
  ],
  exams: [
    {
      date: Date,
      exam: String
    }
  ]
});

const model = mongoose.model('ProfileModels', profileSchema);

module.exports = model;