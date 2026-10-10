/**
 * Deterministic teaching model. automation and review are percentages [0, 100].
 * Counts are expected values, not sampled outcomes or physical product yield.
 * Review covers AI decisions only; its independent 95% catch rate does not
 * introduce additional mistakes. Processing time is a serial sum, not wall time.
 */
export function simulate({ automation = 60, review = 55 } = {}) {
  const percent = value => Number.isFinite(Number(value)) ? Math.min(100, Math.max(0, Number(value))) : 0;
  const a = percent(automation) / 100;
  const r = percent(review) / 100;
  const batchSize = 100;
  const aiCount = batchSize * a;
  const manualCount = batchSize - aiCount;
  const aiErrorRate = 0.01 + 0.11 * a ** 2;
  const aiErrorsBeforeReview = aiCount * aiErrorRate;
  const reviewCount = aiCount * r;
  const caughtErrors = aiErrorsBeforeReview * r * 0.95;
  const retainedAiErrors = aiErrorsBeforeReview - caughtErrors;
  const manualErrors = manualCount * 0.02;
  const correctCount = batchSize - retainedAiErrors - manualErrors;
  const processingMinutes = manualCount * 2 + aiCount * 0.25 + reviewCount * 2 + caughtErrors * 3;
  return {
    automation: a * 100, review: r * 100, batchSize, aiCount, manualCount,
    aiErrorRate, aiErrorsBeforeReview, reviewCount, caughtErrors,
    retainedAiErrors, manualErrors, correctCount, processingMinutes,
    baseline: { correctCount: 98, processingMinutes: 200, manualCount: 100 },
  };
}
