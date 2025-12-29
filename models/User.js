import mongoose from "mongoose";

/**
 * ------------------------------------------------------
 * User Schema
 * ------------------------------------------------------
 * Hardened, production-safe, auth-compatible
 */
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    avatar: {
      type: String,
      default: "",
      maxlength: 500,
    },

    onboarded: {
      type: Boolean,
      default: false,
      index: true,
    },

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    lastLogin: {
      type: Date,
      default: Date.now,
      index: true,
    },

    analysisCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "users",
  }
);

/* ------------------------------------------------------
 * Instance Methods
 * ------------------------------------------------------ */
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    onboarded: this.onboarded,
  };
};

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateModifiedOnly: true });
};

userSchema.methods.completeOnboarding = async function () {
  if (!this.onboarded) {
    this.onboarded = true;
    await this.save({ validateModifiedOnly: true });
  }
};

/* ------------------------------------------------------
 * Model Export
 * ------------------------------------------------------ */
const User = mongoose.model("User", userSchema);

export default User;
