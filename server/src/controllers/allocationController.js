const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { manuallyAllocateRoom } = require('../services/allocationService');

// Get all allocations
const getAllAllocations = async (req, res, next) => {
  try {
    const allocations = await Allocation.find()
      .populate('booking')
      .populate('room')
      .populate('allocatedBy');

    res.status(200).json({
      success: true,
      count: allocations.length,
      allocations,
    });
  } catch (error) {
    next(error);
  }
};

// Create allocation (Manual - Room Manager)
const createAllocation = async (req, res, next) => {
  try {
    const { bookingId, roomId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!bookingId || !roomId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookingId and roomId.',
      });
    }

    // Use allocation service to validate and allocate
    const allocation = await manuallyAllocateRoom(bookingId, roomId, userId);

    res.status(201).json({
      success: true,
      message: 'Room allocated successfully.',
      allocation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get allocation by ID
const getAllocationById = async (req, res, next) => {
  try {
    const allocation = await Allocation.findById(req.params.id)
      .populate('booking')
      .populate('room')
      .populate('allocatedBy');

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found.',
      });
    }

    const privilegedRoles = ['ADMIN', 'ROOM_MANAGER', 'AUDITOR'];
    const isBookingOwner = allocation.booking && String(allocation.booking.user) === String(req.user.id);
    if (!privilegedRoles.includes(req.user.role) && !isBookingOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this allocation.',
      });
    }

    res.status(200).json({
      success: true,
      allocation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAllocations,
  createAllocation,
  getAllocationById,
};
