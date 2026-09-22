const Room = require('../models/Room');
const { checkAvailability } = require('../services/bookingService');

// Get all rooms
const getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().populate('roomType').populate('location');

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// Get room by ID
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('roomType').populate('location');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Create room (Admin/Room Manager)
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, location, floor, capacity } = req.body;

    // Validate input
    if (!roomNumber || !roomType || !floor || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      location,
      floor,
      capacity,
      status: 'AVAILABLE',
    });

    await room.populate(['roomType', 'location']);

    res.status(201).json({
      success: true,
      message: 'Room created successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Update room (Admin/Room Manager)
const updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, location, floor, capacity, status } = req.body;

    let updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (roomType) updateData.roomType = roomType;
    if (location) updateData.location = location;
    if (floor) updateData.floor = floor;
    if (capacity) updateData.capacity = capacity;
    if (status) updateData.status = status;

    const room = await Room.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('roomType').populate('location');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room updated successfully.',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// Delete room (Admin only)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Get available rooms
const getAvailableRooms = async (req, res, next) => {
  try {
    const { roomType, location, checkIn, checkOut, guests } = req.query;

    // Validate input
    if (!roomType || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomType, checkIn, checkOut, and guests.',
      });
    }

    const availableRooms = await checkAvailability(
      roomType,
      new Date(checkIn),
      new Date(checkOut),
      parseInt(guests),
      location
    );

    res.status(200).json({
      success: true,
      count: availableRooms.length,
      rooms: availableRooms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
};
