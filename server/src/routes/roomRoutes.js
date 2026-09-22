const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require('../controllers/roomController');

const router = express.Router();

// Get all rooms (public)
router.get('/', getAllRooms);

// Get available rooms (public) - query endpoint
router.get('/available', getAvailableRooms);

// Get room by ID (public)
router.get('/:id', getRoomById);

// Create room (Admin, Room Manager)
router.post('/', authenticate, authorize(['ADMIN', 'ROOM_MANAGER']), createRoom);

// Update room (Admin, Room Manager)
router.patch('/:id', authenticate, authorize(['ADMIN', 'ROOM_MANAGER']), updateRoom);

// Delete room (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoom);

module.exports = router;
