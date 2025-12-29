/**
 * Measure execution time for an operation
 */
export const measureTime = () => {
  const start = process.hrtime.bigint();

  return () => {
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // milliseconds
  };
};
