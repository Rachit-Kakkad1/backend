import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * ------------------------------------------------------
 * JWT Authentication Middleware
 * ------------------------------------------------------
 * - Verifies JWT signature
 * - Validates issuer & audience
 * - Fetches user from MongoDB
 * - Attaches req.user and req.userId
 * ------------------------------------------------------
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: "sentinai",
        audience: "sentinai-users",
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }

    if (!decoded?.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      active: true,
    }).select("-__v");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    // Attach to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * ------------------------------------------------------
 * Optional Authentication Middleware
 * ------------------------------------------------------
 * - Does NOT block request
 * - Attaches user if token exists and is valid
 * ------------------------------------------------------
 */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.slice(7).trim();

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "sentinai",
      audience: "sentinai-users",
    });

    if (!mongoose.Types.ObjectId.isValid(decoded?.userId)) return next();

    const user = await User.findOne({
      _id: decoded.userId,
      active: true,
    }).select("-__v");

    if (user) {
      req.user = user;
      req.userId = user._id;
    }
  } catch {
    // Silent fail for optional auth
  }

  next();
};

export default authenticateToken;
