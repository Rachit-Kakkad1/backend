export function generateSummary({
  vulnerabilities,
  overallRiskScore,
  attackerView,
  defenderFixes,
  simulatedPayloads,
  impactAnalysis,
}) {
  return {
    totalVulnerabilities: vulnerabilities.length,

    severityBreakdown: vulnerabilities.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {}),

    overallRiskScore,

    keyFindings: vulnerabilities.map((v) => v.type),

    attackerPerspective: attackerView?.summary || "No attacker path identified",

    defenderRecommendations: defenderFixes?.length || 0,

    businessImpact: impactAnalysis?.businessImpact || "Low",

    generatedAt: new Date().toISOString(),
  };
}
