// ==================================================
// Shared enums & base types (BACKEND SOURCE OF TRUTH)
// ==================================================

export type InputType = "code" | "api" | "sql" | "config";

// Backend + DB canonical severity (DO NOT CHANGE CASING)
export type Severity = "Low" | "Medium" | "High" | "Critical";

// ==================================================
// Vulnerability (MERGED: OLD + NEW, BACKWARD SAFE)
// ==================================================

export interface Vulnerability {
  // Core identifiers
  id?: string;        // old frontend
  _id?: string;       // new frontend / Mongo
  name?: string;      // old engine
  type?: string;      // new engine

  // Classification
  severity: Severity;

  // Description & location
  description: string;
  location?: string;

  // Attacker / Defender views
  attackerLogic?: string;
  defenderLogic?: string;
  secureCodeFix?: string;

  // Advanced engine outputs
  simulatedPayload?: string;
  killChainStage?: string;

  impact?: {
    technical?: string;
    business?: string;
  };
}

// ==================================================
// Analyze request
// ==================================================

export interface AnalysisRequest {
  inputType: InputType;
  content: string;
  useAI?: boolean;
}

// ==================================================
// Engine sub-structures (OLD FRONTEND SUPPORT)
// ==================================================

export interface AttackerView {
  abuseLogic: string;
  defenderLogic?: string; // Sometimes confused in old engine
}

export interface DefenderFix {
  secureFix: string;
  secureExample: string;
}

export interface SimulatedPayload {
  payloads: string[];
}

export interface ImpactAnalysis {
  killChainStage: string;
  technicalImpact: string;
  businessImpact: string;
}

// ==================================================
// Syntax Validation (NEW)
// ==================================================
export interface SyntaxError {
  message: string;
  line: number;
  column: number;
}

export interface SyntaxResult {
  valid: boolean;
  language: string;
  errors: SyntaxError[];
}

// ==================================================
// Analyze response (MERGED SHAPE)
// ==================================================

export interface AnalysisResult {
  // Old frontend fields
  success?: boolean;
  overallRiskScore?: number;

  // Core (shared)
  riskScore: number;
  vulnerabilities: Vulnerability[];

  // Syntax Validation
  syntax?: SyntaxResult;
  engineDecision?: string;

  // Old engine outputs (optional, FIXES YOUR 8 ERRORS)
  attackerView?: AttackerView[];
  defenderFixes?: DefenderFix[];
  simulatedPayloads?: SimulatedPayload[];
  impactAnalysis?: ImpactAnalysis[];

  summary?: {
    total: number;
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  processingTime?: number;

  // New frontend / DB fields
  _id?: string;
  inputType?: InputType;
  content?: string;
  createdAt?: string;
  updatedAt?: string;

  // AI Analysis Result
  ai?: {
    enabled: boolean;
    advisoryOnly?: boolean;
    explanation?: {
      summary: string;
      perVulnerability: Record<string, string>;
    };
    codeSuggestions?: Record<string, {
      guidance: string;
      snippet: string | null;
      language: string;
    }>;
    hypotheses?: Array<{
      title: string;
      confidence: "low" | "medium";
      reasoning: string;
      unverified: boolean;
    }>;
  };
}

// ==================================================
// EthicalNotice (for EthicalBanner)
// ==================================================
export interface EthicalNotice {
  title: string;
  content: string;
}

// ==================================================
// AnalysisHistoryItem (for history listing)
// ==================================================
export interface AnalysisHistoryItem {
  id: string;
  inputType: InputType;
  analysisDate: string;
  overallRiskScore: number;
  vulnerabilityCount: number;
}

// ==================================================
// DashboardMetrics
// ==================================================
export interface DashboardMetrics {
  totalScans: number;
  totalVulnerabilities: number;
  severityDistribution: {
    Low: number;
    Medium: number;
    High: number;
    Critical: number;
  };
  riskTrends: Array<{ date: string; riskScore: number }>;
}
