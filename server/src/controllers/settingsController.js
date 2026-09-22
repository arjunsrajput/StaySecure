const Settings = require('../models/Settings');

// Get settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();

    // If settings don't exist, create default
    if (!settings) {
      settings = await Settings.create({ approvalMode: 'MANUAL' });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// Update settings (Admin only)
const updateSettings = async (req, res, next) => {
  try {
    const { approvalMode } = req.body;

    // Validate input
    if (!approvalMode || !['AUTOMATIC', 'MANUAL'].includes(approvalMode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid approvalMode (AUTOMATIC or MANUAL).',
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ approvalMode });
    } else {
      settings.approvalMode = approvalMode;
      settings.updatedAt = new Date();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
