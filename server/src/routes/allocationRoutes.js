const express = require('express');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const {
  getAllAllocations,
  createAllocation,
  getAllocationById,
} = require('../controllers/allocationController');

const router = express.Router();

// All allocation routes require authentication
router.use(authenticate);

// Get all allocations (Room Manager, Admin, Auditor)
router.get('/', authorize(['ROOM_MANAGER', 'ADMIN', 'AUDITOR']), getAllAllocations);

// Create allocation (Room Manager, Admin) - Manual allocation
router.post('/', authorize(['ROOM_MANAGER', 'ADMIN']), createAllocation);

// Get allocation by ID (Any authenticated user)
router.get('/:id', getAllocationById);

module.exports = router;
