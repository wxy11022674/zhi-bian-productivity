import test from 'node:test';
import assert from 'node:assert/strict';
import { simulate } from '../src/simulation.js';

test('all-manual endpoint matches the 200 minute / 98 correct baseline', () => {
  const result = simulate({ automation: 0, review: 100 });
  assert.equal(result.correctCount, 98);
  assert.equal(result.processingMinutes, 200);
  assert.equal(result.reviewCount, 0);
  assert.equal(result.retainedAiErrors, 0);
  const unreviewed = simulate({ automation: 0, review: 0 });
  assert.equal(result.correctCount, unreviewed.correctCount);
  assert.equal(result.processingMinutes, unreviewed.processingMinutes);
});

test('all-AI endpoints implement error and review assumptions', () => {
  const direct = simulate({ automation: 100, review: 0 });
  assert.equal(direct.aiErrorRate, 0.12);
  assert.equal(direct.correctCount, 88);
  assert.equal(direct.processingMinutes, 25);
  const reviewed = simulate({ automation: 100, review: 100 });
  assert.ok(Math.abs(reviewed.correctCount - 99.4) < 1e-10);
  assert.ok(Math.abs(reviewed.processingMinutes - 259.2) < 1e-10);
  assert.equal(reviewed.reviewCount, 100);
});

test('more review reduces retained AI errors and increases serial time', () => {
  for (const automation of [1, 30, 60, 100]) {
    let previous = simulate({ automation, review: 0 });
    for (let review = 10; review <= 100; review += 10) {
      const next = simulate({ automation, review });
      assert.ok(next.retainedAiErrors < previous.retainedAiErrors);
      assert.ok(next.correctCount > previous.correctCount);
      assert.ok(next.processingMinutes > previous.processingMinutes);
      previous = next;
    }
  }
});

test('expanded AI scope strictly raises AI error rate and original AI errors', () => {
  let previous = simulate({ automation: 0, review: 50 });
  for (let automation = 1; automation <= 100; automation++) {
    const next = simulate({ automation, review: 50 });
    assert.ok(next.aiErrorRate > previous.aiErrorRate);
    assert.ok(next.aiErrorsBeforeReview > previous.aiErrorsBeforeReview);
    previous = next;
  }
});

test('model conserves task counts and yields finite bounded outcomes', () => {
  for (let automation = 0; automation <= 100; automation += 5) {
    for (let review = 0; review <= 100; review += 5) {
      const result = simulate({ automation, review });
      for (const value of Object.values(result)) if (typeof value === 'number') assert.ok(Number.isFinite(value));
      assert.equal(result.aiCount + result.manualCount, 100);
      assert.ok(result.correctCount >= 0 && result.correctCount <= 100);
      assert.ok(Math.abs(result.correctCount + result.manualErrors + result.retainedAiErrors - 100) < 1e-10);
      assert.ok(result.reviewCount <= result.aiCount);
      assert.ok(result.caughtErrors <= result.aiErrorsBeforeReview);
    }
  }
});

test('scenarios are deterministic and inputs are clamped safely', () => {
  assert.deepEqual(simulate({ automation: 60, review: 55 }), simulate({ automation: 60, review: 55 }));
  assert.deepEqual(simulate({ automation: 120, review: -2 }), simulate({ automation: 100, review: 0 }));
  assert.deepEqual(simulate({ automation: NaN, review: Infinity }), simulate({ automation: 0, review: 0 }));
});
