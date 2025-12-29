import Analysis from "../models/Analysis.js";

/**
 * ------------------------------------------------------
 * GET /api/dashboard/metrics
 * ------------------------------------------------------
 */
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.userId;

    /* ---------------- Total Scans ---------------- */
    const totalScans = await Analysis.countDocuments({ userId });

    /* ---------------- Fetch Analyses ---------------- */
    const analyses = await Analysis.find({ userId }).lean();

    const severityDistribution = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    let totalVulnerabilities = 0;
    let totalRiskScore = 0;

    analyses.forEach((analysis) => {
      totalRiskScore += analysis.overallRiskScore || 0;

      (analysis.vulnerabilities || []).forEach((vuln) => {
        if (severityDistribution[vuln.severity] !== undefined) {
          severityDistribution[vuln.severity]++;
        }
        totalVulnerabilities++;
      });
    });

    const averageRiskScore =
      totalScans > 0 ? Math.round(totalRiskScore / totalScans) : 0;

    /* ---------------- Risk Trends (30 Days) ---------------- */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalyses = await Analysis.find({
      userId,
      analysisDate: { $gte: thirtyDaysAgo },
    })
      .sort({ analysisDate: 1 })
      .lean();

    const riskTrends = recentAnalyses.map((a) => ({
      date: a.analysisDate.toISOString().split("T")[0],
      riskScore: a.overallRiskScore,
    }));

    /* ---------------- Response ---------------- */
    res.status(200).json({
      success: true,
      metrics: {
        totalScans,
        totalVulnerabilities,
        averageRiskScore,
        severityDistribution,
        riskTrends,
      },
    });
  } catch (error) {
    next(error);
  }
  
};
