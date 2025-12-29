import mongoose from "mongoose";

/**
 * ------------------------------------------------------
 * Vulnerability Subdocument Schema
 * ------------------------------------------------------
 * Stores analyzed security findings (NO raw input content)
 */
const vulnerabilitySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      maxlength: 120,
    },

    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      required: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    attackerLogic: {
      type: String,
      maxlength: 500,
    },

    defenderLogic: {
      type: String,
      maxlength: 500,
    },

    secureCodeFix: {
      type: String,
      maxlength: 1000,
    },
  },
  { _id: false }
);

/**
 * ------------------------------------------------------
 * Analysis Schema
 * ------------------------------------------------------
 * Ethical, privacy-safe, production-ready
 */
const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    inputType: {
      type: String,
      enum: ["code", "api", "sql", "config"],
      required: true,
      index: true,
    },

    // Raw content is intentionally NOT stored
    // Optional hash for future comparison / deduplication
    contentHash: {
      type: String,
      maxlength: 128,
      index: true,
    },

    overallRiskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },

    vulnerabilities: {
      type: [vulnerabilitySchema],
      default: [],
    },

    analysisDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    processingTime: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "analyses",
  }
);

/* ------------------------------------------------------
 * Indexes
 * ------------------------------------------------------ */
analysisSchema.index({ userId: 1, analysisDate: -1 });
analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ overallRiskScore: -1 });

/* ------------------------------------------------------
 * Instance Methods
 * ------------------------------------------------------ */
analysisSchema.methods.toClientFormat = function () {
  return {
    id: this._id.toString(),
    inputType: this.inputType,
    overallRiskScore: this.overallRiskScore,
    vulnerabilities: this.vulnerabilities,
    analysisDate: this.analysisDate,
    processingTime: this.processingTime,
  };
};

/* ------------------------------------------------------
 * Static Methods
 * ------------------------------------------------------ */
analysisSchema.statics.getUserStats = async function (userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      totalAnalyses: 0,
      avgRiskScore: 0,
      maxRiskScore: 0,
      minRiskScore: 0,
    };
  }

  const [stats] = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        avgRiskScore: { $avg: "$overallRiskScore" },
        maxRiskScore: { $max: "$overallRiskScore" },
        minRiskScore: { $min: "$overallRiskScore" },
      },
    },
  ]);

  return (
    stats || {
      totalAnalyses: 0,
      avgRiskScore: 0,
      maxRiskScore: 0,
      minRiskScore: 0,
    }
  );
};

analysisSchema.statics.getRecentAnalyses = async function (userId, limit = 10) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  return this.find({ userId })
    .sort({ analysisDate: -1 })
    .limit(safeLimit)
    .select("-__v")
    .lean();
};

/* ------------------------------------------------------
 * Model Export
 * ------------------------------------------------------ */
const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
