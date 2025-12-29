import User from "../models/User.js";

/**
 * ------------------------------------------------------
 * GET /api/profile
 * ------------------------------------------------------
 */
export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      profile: user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/**
 * ------------------------------------------------------
 * PUT /api/profile
 * Update name / avatar only
 * ------------------------------------------------------
 */
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, avatar } = req.body;

    if (name && typeof name === "string") {
      user.name = name.trim();
    }

    if (avatar && typeof avatar === "string") {
      user.avatar = avatar.trim();
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      profile: user.toPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/**
 * ------------------------------------------------------
 * DELETE /api/profile
 * Soft deactivate account
 * ------------------------------------------------------
 */
export const deactivateProfile = async (req, res) => {
  try {
    const user = req.user;

    user.active = false;
    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to deactivate account",
    });
  }
};
