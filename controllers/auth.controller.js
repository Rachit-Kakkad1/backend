import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";

/**
 * ------------------------------------------------------
 * JWT Generator
 * ------------------------------------------------------
 */
const generateJWT = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
      issuer: "sentinai",
      audience: "sentinai-users",
    }
  );
};

/**
 * ------------------------------------------------------
 * POST /api/auth/google
 * Google OAuth Login
 * ------------------------------------------------------
 */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid Google token is required",
      });
    }

    // Verify Google ID token
    const googleUser = await verifyGoogleToken(token);

    // Find or create user
    let user = await User.findOne({ googleId: googleUser.googleId });

    if (!user) {
      user = await User.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        onboarded: false,
        active: true,
        lastLogin: new Date(),
      });
    } else {
      user.name = googleUser.name;
      user.avatar = googleUser.avatar;
      user.lastLogin = new Date();
      await user.save({ validateModifiedOnly: true });
    }

    // Generate JWT
    const jwtToken = generateJWT(user._id.toString());

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("Google login error:", error.message);

    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * ------------------------------------------------------
 * POST /api/auth/complete-onboarding
 * ------------------------------------------------------
 */
export const completeOnboarding = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!user.onboarded) {
      user.onboarded = true;
      await user.save({ validateModifiedOnly: true });
    }

    res.status(200).json({
      success: true,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    console.error("Complete onboarding error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to complete onboarding",
    });
  }
};

/**
 * ------------------------------------------------------
 * GET /api/auth/me
 * Get current authenticated user
 * ------------------------------------------------------
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      user: req.user.toPublicProfile(),
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

/**
 * ------------------------------------------------------
 * POST /api/auth/logout
 * Stateless logout (client-side token removal)
 * ------------------------------------------------------
 */
export const logout = async (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
