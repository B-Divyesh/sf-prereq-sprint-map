import { describe, expect, it } from 'vitest';
import { calculateCapacity, clampEstimateMinutes, completion, datePlusDays, emptyPlan, validatePlan, type Plan } from './model';

const fixedNow = new Date(2026, 7, 27, 12);

function samplePlan(): Plan {
  return {
    ...emptyPlan(),
    target: 'Learn trees',
    targetDate: '2026-09-09',
    hoursPerWeek: 5,
    sessionMinutes: 30,
    prerequisites: [
      { id: 'a', title: 'Arrays', minutes: 60, required: true, known: false, done: false },
      { id: 'b', title: 'Loops', minutes: 45, required: true, known: true, done: false },
      { id: 'c', title: 'Proofs', minutes: 90, required: false, known: false, done: true },
    ],
    exercises: [{ id: 'x', title: 'Build a tree', minutes: 90, done: false }],
  };
}

describe('capacity math', () => {
  it('counts the target day and ignores diagnosed or completed work', () => {
    const capacity = calculateCapacity(samplePlan(), fixedNow);
    expect(capacity.days).toBe(14);
    expect(capacity.availableMinutes).toBe(600);
    expect(capacity.prerequisiteMinutes).toBe(60);
    expect(capacity.targetMinutes).toBe(90);
    expect(capacity.marginMinutes).toBe(450);
    expect(capacity.percent).toBe(100);
  });

  it('reports a past deadline without negative capacity', () => {
    const plan = samplePlan();
    plan.targetDate = '2026-08-26';
    const capacity = calculateCapacity(plan, fixedNow);
    expect(capacity.isPast).toBe(true);
    expect(capacity.days).toBe(0);
    expect(capacity.availableMinutes).toBe(0);
    expect(capacity.marginMinutes).toBe(-150);
  });
});

describe('plan boundaries', () => {
  it('creates local date strings without UTC rollover', () => {
    expect(datePlusDays(2, new Date(2026, 11, 30, 23))).toBe('2027-01-01');
  });

  it('rejects malformed imports', () => {
    expect(() => validatePlan({ version: 1, target: 'x', targetDate: '2026-09-01' })).toThrow('missing its lanes');
  });

  it('clamps untrusted imported capacity values', () => {
    const raw = { ...samplePlan(), hoursPerWeek: 999, sessionMinutes: -4 };
    const parsed = validatePlan(raw);
    expect(parsed.hoursPerWeek).toBe(80);
    expect(parsed.sessionMinutes).toBe(10);
  });

  it('keeps estimates inside the declared five to 10,000 minute contract', () => {
    expect(clampEstimateMinutes(5)).toBe(5);
    expect(clampEstimateMinutes(10_000)).toBe(10_000);
    expect(clampEstimateMinutes(10_001)).toBe(10_000);
    expect(clampEstimateMinutes(4)).toBe(5);

    const raw = samplePlan();
    raw.prerequisites[0].minutes = 10_001;
    raw.exercises[0].minutes = 10_000;
    const parsed = validatePlan(raw);
    expect(parsed.prerequisites[0].minutes).toBe(10_000);
    expect(parsed.exercises[0].minutes).toBe(10_000);
  });

  it.each(['not-a-date', '2026-02-29', '2026-02-30', '2026-2-01', '2026-13-01', '2026-00-01'])(
    'rejects malformed imported target date %s',
    (targetDate) => {
      expect(() => validatePlan({ ...samplePlan(), targetDate })).toThrow('invalid target date');
    },
  );

  it('accepts a valid leap-day target date from an import', () => {
    const parsed = validatePlan({ ...samplePlan(), targetDate: '2028-02-29' });
    expect(parsed.targetDate).toBe('2028-02-29');
  });

  it('tracks the target start independently from prerequisites', () => {
    const plan = samplePlan();
    expect(completion(plan).targetStarted).toBe(false);
    plan.exercises[0].done = true;
    expect(completion(plan)).toEqual({ completed: 3, total: 4, targetStarted: true });
  });
});
