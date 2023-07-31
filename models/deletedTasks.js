const mongoose = require('mongoose');

// This is the model for storing deleted tasks
const deletedSchema = new mongoose.Schema({
  task: {
    type: String,
    unique: false,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('deletedTasks', deletedSchema);
