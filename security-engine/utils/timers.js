/**
 * PERFORMANCE TIMER
 * -----------------
 * Measures analysis execution time
 */

export function measureTime() {
  const start = process.hrtime.bigint();

  return function stop() {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    return `${durationMs.toFixed(2)} ms`;
  };
}
