const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide room type name'],
    enum: ['HOSTEL', 'PG', 'HOTEL', 'GUEST_ROOM', 'DORMITORY'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: 1,
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please provide price per day'],
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RoomType', roomTypeSchema);
