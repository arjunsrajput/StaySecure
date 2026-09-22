const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Settings = require('../models/Settings');
const RoomType = require('../models/RoomType');
const Location = require('../models/Location');
const { calculateTotalAmount } = require('../services/pricingService');
const { autoAllocateAndConfirmBooking, checkAvailability } = require('../services/bookingService');
const { buildAuditEntry, logAuditEvent } = require('../services/auditService');

// Create booking
const createBooking = async (req, res, next) => {
  try {
    const { roomType, location, checkInDate, checkOutDate, numberOfGuests } = req.body;
    const userId = req.user.id;

    if (!roomType || !checkInDate || !checkOutDate || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    if (Number(numberOfGuests) < 1 || Number(numberOfGuests) > 20) {
      return res.status(400).json({
        success: false,
        message: 'Guests count must be between 1 and 20.',
      });
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date.',
      });
    }

    // Get room type
    const roomTypeData = await RoomType.findById(roomType);
    if (!roomTypeData) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    if (location) {
      const locationData = await Location.findOne({ _id: location, isActive: true });
      if (!locationData) {
        return res.status(400).json({
          success: false,
          message: 'Selected location is not available.',
        });
      }
    }

    // Validate guest count
    if (numberOfGuests > roomTypeData.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${roomTypeData.capacity} guests allowed for this room type.`,
      });
    }

    // Calculate total amount
    const totalAmount = calculateTotalAmount(roomTypeData.pricePerDay, checkIn, checkOut);

    // Create booking
    const booking = await Booking.create({
      user: userId,
      roomType,
      location,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalAmount,
      approvalStatus: 'PENDING',
      bookingStatus: 'REQUESTED',
      paymentStatus: 'PENDING',
    });

    // Get approval mode
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ approvalMode: 'MANUAL' });
    }

    // If AUTOMATIC mode, auto approve and allocate
    if (settings.approvalMode === 'AUTOMATIC') {
      const result = await autoAllocateAndConfirmBooking(booking, userId);
      if (!result.success) {
        // Booking created but cannot be confirmed
        await booking.save();
        return res.status(400).json({
          success: false,
          message: result.message,
          booking,
        });
      }
      return res.status(201).json({
        success: true,
        message: 'Booking created and automatically confirmed.',
        booking: result.booking,
        allocation: result.allocation,
      });
    }

    // If MANUAL mode, just create booking request
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request created. Waiting for approval.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings (Admin/Auditor/Room Manager)
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user')
      .populate('roomType')
      .populate('location');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get approved bookings for allocation review and downstream fulfillment
const getApprovedBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ approvalStatus: 'APPROVED' })
      .populate('user')
      .populate('roomType')
      .populate('location');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get my bookings (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('roomType')
      .populate('location');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('roomType')
      .populate('location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const privilegedRoles = ['ADMIN', 'AUDITOR', 'ROOM_MANAGER', 'APPROVAL_MANAGER', 'ACCOUNTANT'];
    const isBookingOwner = req.user.id === String(booking.user._id || booking.user);
    if (!privilegedRoles.includes(req.user.role) && !isBookingOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending bookings (Approval Manager)
const getPendingBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ approvalStatus: 'PENDING' })
      .populate('user')
      .populate('roomType');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Approve booking (Approval Manager)
const approveBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.approvalStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be approved.',
      });
    }

    booking.approvalStatus = 'APPROVED';
    booking.bookingStatus = 'CONFIRMED';
    await booking.save();

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_APPROVED',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: { bookingNumber: booking.bookingNumber, approvalStatus: booking.approvalStatus },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_APPROVED',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: { bookingNumber: booking.bookingNumber, approvalStatus: booking.approvalStatus },
    });

    res.status(200).json({
      success: true,
      message: 'Booking approved successfully.',
      booking,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Reject booking (Approval Manager)
const rejectBooking = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (booking.approvalStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rejected.',
      });
    }

    booking.approvalStatus = 'REJECTED';
    booking.rejectionReason = rejectionReason || 'No reason provided.';
    await booking.save();

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_REJECTED',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: {
        bookingNumber: booking.bookingNumber,
        approvalStatus: booking.approvalStatus,
        rejectionReason: booking.rejectionReason,
      },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_REJECTED',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: {
        bookingNumber: booking.bookingNumber,
        approvalStatus: booking.approvalStatus,
        rejectionReason: booking.rejectionReason,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully.',
      booking,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking (Customer)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Check if booking can be cancelled
    if (req.user.role !== 'ADMIN' && req.user.id !== String(booking.user)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
    }

    if (['CHECKED_IN', 'CHECKED_OUT'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a checked-in or checked-out booking.',
      });
    }

    booking.bookingStatus = 'CANCELLED';
    await booking.save();

    const auditEntry = buildAuditEntry({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_CANCELLED',
      resourceType: 'Booking',
      resourceId: booking._id,
      details: { bookingNumber: booking.bookingNumber, status: booking.bookingStatus },
    });
    await logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'BOOKING_CANCELLED',
      resourceType: 'Booking',
      resourceId: String(booking._id),
      details: { bookingNumber: booking.bookingNumber, status: booking.bookingStatus },
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
      audit: auditEntry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getApprovedBookings,
  getBookingById,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
};
