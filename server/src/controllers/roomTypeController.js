const RoomType = require('../models/RoomType');

// Get all room types
const getAllRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.find();

    res.status(200).json({
      success: true,
      count: roomTypes.length,
      roomTypes,
    });
  } catch (error) {
    next(error);
  }
};

// Get room type by ID
const getRoomTypeById = async (req, res, next) => {
  try {
    const roomType = await RoomType.findById(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    res.status(200).json({
      success: true,
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Create room type (Admin only)
const createRoomType = async (req, res, next) => {
  try {
    const { name, description, capacity, pricePerDay, isActive } = req.body;

    // Validate input
    if (!name || !description || !capacity || !pricePerDay) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.',
      });
    }

    const roomType = await RoomType.create({
      name,
      description,
      capacity,
      pricePerDay,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Room type created successfully.',
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Update room type (Admin only)
const updateRoomType = async (req, res, next) => {
  try {
    const { name, description, capacity, pricePerDay, isActive } = req.body;

    let updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (capacity) updateData.capacity = capacity;
    if (pricePerDay !== undefined) updateData.pricePerDay = pricePerDay;
    if (isActive !== undefined) updateData.isActive = isActive;

    const roomType = await RoomType.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type updated successfully.',
      roomType,
    });
  } catch (error) {
    next(error);
  }
};

// Delete room type (Admin only)
const deleteRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndDelete(req.params.id);

    if (!roomType) {
      return res.status(404).json({
        success: false,
        message: 'Room type not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Room type deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
