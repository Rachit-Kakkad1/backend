import os from "os";

/**
 * SYSTEM HEALTH CONTROLLER
 * ------------------------
 * Exposes runtime health metrics only.
 * NO security logic.
 * NO infrastructure coupling.
 */
export const getSystemHealth = async (req, res) => {
  const start = process.hrtime.bigint();

  // CPU usage (Node process)
  const cpuUsage = process.cpuUsage();
  const totalCpuTime = cpuUsage.user + cpuUsage.system; // microseconds

  // Normalize to percentage (single-core approximation)
  const cpuPercent = Math.min(
    100,
    Math.round((totalCpuTime / 1_000_000) % 100)
  );

  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1_000_000;

  return res.json({
    cpuUsagePercent: cpuPercent,
    apiLatencyMs: Math.round(latencyMs),
    timestamp: new Date().toISOString(),
  });
};
