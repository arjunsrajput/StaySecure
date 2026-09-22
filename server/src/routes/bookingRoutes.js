const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getApprovedBookings,
  getBookingById,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// Create booking (Customer)
router.post('/', authorize('CUSTOMER'), createBooking);

// Get my bookings (Customer)
router.get('/my', authorize('CUSTOMER'), getMyBookings);

// Get all bookings (Admin, Auditor, Room Manager, Approval Manager, Accountant)
router.get('/', authorize(['ADMIN', 'AUDITOR', 'ROOM_MANAGER', 'APPROVAL_MANAGER', 'ACCOUNTANT']), getAllBookings);

// Get approved bookings for allocation and downstream processing
router.get('/approved', authorize(['ROOM_MANAGER', 'ADMIN', 'AUDITOR']), getApprovedBookings);

// Get pending bookings (Approval Manager, Admin)
router.get('/pending', authorize(['APPROVAL_MANAGER', 'ADMIN']), getPendingBookings);

// Get booking by ID (Any authenticated user)
router.get('/:id', getBookingById);

// Approve booking (Approval Manager, Admin)
router.patch('/:id/approve', authorize(['APPROVAL_MANAGER', 'ADMIN']), approveBooking);

// Reject booking (Approval Manager, Admin)
router.patch('/:id/reject', authorize(['APPROVAL_MANAGER', 'ADMIN']), rejectBooking);

// Cancel booking (Customer, Admin)
router.patch('/:id/cancel', authorize(['CUSTOMER', 'ADMIN']), cancelBooking);

module.exports = router;
