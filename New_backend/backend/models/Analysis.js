import mongoose from "mongoose";

/**
 * ------------------------------------------------------
 * Vulnerability Subdocument Schema
 * ------------------------------------------------------
 * Stores PURE security findings (no explanations)
 */
const vulnerabilitySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      maxlength: 120,
    },

    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      required: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },

    location: {
      type: String,
      maxlength: 200,
    },
  },
  { _id: false }
);

/**
 * ------------------------------------------------------
 * Analysis Schema
 * ------------------------------------------------------
 * Ethical, privacy-safe, storage-minimal
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
 
    // Optional educational views (stored if available)
    attackerView: {
      type: [new mongoose.Schema({ abuseLogic: String }, { _id: false })],
      default: [],
    },
    defenderFixes: {
      type: [new mongoose.Schema({ secureFix: String, secureExample: String }, { _id: false })],
      default: [],
    },
    impactAnalysis: {
      type: [
        new mongoose.Schema(
          { technicalImpact: String, businessImpact: String, killChainStage: String },
          { _id: false }
        ),
      ],
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

    /* 🆕 Engine Metadata */
    engineDecision: {
      type: String,
      maxlength: 50,
      default: "COMPLETED",
    },

    syntax: {
      valid: { type: Boolean, default: true },
      language: String,
      errors: [{
        message: String,
        line: Number,
        column: Number,
        _id: false
      }]
    },
 
    ethics: {
      staticAnalysisOnly: { type: Boolean, default: true },
      noExecution: { type: Boolean, default: true },
      aiAdvisoryOnly: { type: Boolean, default: true },
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

const Analysis = mongoose.model("Analysis", analysisSchema);
export default Analysis;
