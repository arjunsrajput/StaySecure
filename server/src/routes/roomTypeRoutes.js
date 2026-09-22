const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require('../controllers/roomTypeController');

const router = express.Router();

// Get all room types (public)
router.get('/', getAllRoomTypes);

// Get room type by ID (public)
router.get('/:id', getRoomTypeById);

// Create room type (Admin only)
router.post('/', authenticate, authorize('ADMIN'), createRoomType);

// Update room type (Admin only)
router.patch('/:id', authenticate, authorize('ADMIN'), updateRoomType);

// Delete room type (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoomType);

module.exports = router;
