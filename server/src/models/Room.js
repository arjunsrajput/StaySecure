const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide room number'],
    unique: true,
    trim: true,
  },
  roomType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomType',
    required: [true, 'Please provide room type'],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  floor: {
    type: Number,
    required: [true, 'Please provide floor number'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: 1,
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'BLOCKED'],
    default: 'AVAILABLE',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);
