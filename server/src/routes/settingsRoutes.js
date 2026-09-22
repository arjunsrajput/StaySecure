const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getSettings,
  updateSettings,
} = require('../controllers/settingsController');

const router = express.Router();

// Get settings (public)
router.get('/', getSettings);

// Update settings (Admin only)
router.patch('/', authenticate, authorize('ADMIN'), updateSettings);

module.exports = router;
