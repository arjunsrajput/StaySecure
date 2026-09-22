const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  checkIn,
  checkOut,
  getTodayCheckIns,
  getTodayCheckOuts,
} = require('../controllers/receptionController');

const router = express.Router();

// All reception routes require authentication and Receptionist role
router.use(authenticate);
router.use(authorize('RECEPTIONIST'));

// Check-in (Receptionist)
router.patch('/:id/check-in', checkIn);

// Check-out (Receptionist)
router.patch('/:id/check-out', checkOut);

// Get today's check-ins (Receptionist)
router.get('/today/check-ins', getTodayCheckIns);

// Get today's check-outs (Receptionist)
router.get('/today/check-outs', getTodayCheckOuts);

module.exports = router;
