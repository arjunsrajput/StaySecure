const Booking = require('../models/Booking');
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const { buildAuditEntry, logAuditEvent } = require('../services/auditService');

// Check-in (Receptionist)
const checkIn = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Booking must be confirmed
    if (booking.bookingStatus !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be checked in.',
      });
    }

    // Check if room is allocated
    const allocation = await Allocation.findOne({ booking: req.params.id }).populate('room');

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Room not allocated for this booking.',
      });
    }

    booking.bookingStatus = 'CHECKED_IN';
    await booking.save();

    const room = await Room.findByIdAndUpdate(allocation.room._id, { status: 'OCCUPIED' }, { new: true });

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_IN',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_IN',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });

    res.status(200).json({
      success: true,
      message: 'Customer checked in successfully.',
      booking,
      room,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Check-out (Receptionist)
const checkOut = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('roomType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Booking must be checked in
    if (booking.bookingStatus !== 'CHECKED_IN') {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in bookings can be checked out.',
      });
    }

    // Get allocation
    const allocation = await Allocation.findOne({ booking: req.params.id }).populate('room');

    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Room allocation not found.',
      });
    }

    booking.bookingStatus = 'CHECKED_OUT';
    await booking.save();

    const room = await Room.findByIdAndUpdate(allocation.room._id, { status: 'AVAILABLE' }, { new: true });

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_OUT',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CHECK_OUT',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: { bookingNumber: booking.bookingNumber, roomId: room._id },
    });

    res.status(200).json({
      success: true,
      message: 'Customer checked out successfully.',
      booking,
      room,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's check-ins (Receptionist)
const getTodayCheckIns = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkIns = await Booking.find({
      bookingStatus: 'CONFIRMED',
      checkInDate: { $gte: today, $lt: tomorrow },
    })
      .populate('user')
      .populate('roomType');

    res.status(200).json({
      success: true,
      count: checkIns.length,
      checkIns,
    });
  } catch (error) {
    next(error);
  }
};

// Get today's check-outs (Receptionist)
const getTodayCheckOuts = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkOuts = await Booking.find({
      bookingStatus: 'CHECKED_IN',
      checkOutDate: { $gte: today, $lt: tomorrow },
    })
      .populate('user')
      .populate('roomType');

    res.status(200).json({
      success: true,
      count: checkOuts.length,
      checkOuts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayCheckIns,
  getTodayCheckOuts,
};
