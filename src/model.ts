export type Prerequisite = {
  id: string;
  title: string;
  minutes: number;
  required: boolean;
  known: boolean;
  done: boolean;
};

export type Exercise = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

export type Plan = {
  version: 1;
  target: string;
  targetDate: string;
  hoursPerWeek: number;
  sessionMinutes: number;
  assumption: string;
  prerequisites: Prerequisite[];
  exercises: Exercise[];
};

export type Capacity = {
  days: number;
  availableMinutes: number;
  prerequisiteMinutes: number;
  targetMinutes: number;
  totalMinutes: number;
  marginMinutes: number;
  percent: number;
  isPast: boolean;
};

export const emptyPlan = (): Plan => ({
  version: 1,
  target: '',
  targetDate: datePlusDays(14),
  hoursPerWeek: 5,
  sessionMinutes: 30,
  assumption: '',
  prerequisites: [],
  exercises: [],
});

export function datePlusDays(days: number, now = new Date()): string {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const year = next.getFullYear();
  const month = String(next.getMonth() + 1).padStart(2, '0');
  const day = String(next.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateCapacity(plan: Plan, now = new Date()): Capacity {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = parseLocalDate(plan.targetDate);
  const rawDays = Math.ceil((target.getTime() - today.getTime()) / 86_400_000) + 1;
  const days = Math.max(0, rawDays);
  const availableMinutes = Math.floor((days / 7) * plan.hoursPerWeek * 60);
  const prerequisiteMinutes = plan.prerequisites
    .filter((item) => !item.known && !item.done)
    .reduce((sum, item) => sum + item.minutes, 0);
  const targetMinutes = plan.exercises
    .filter((item) => !item.done)
    .reduce((sum, item) => sum + item.minutes, 0);
  const totalMinutes = prerequisiteMinutes + targetMinutes;
  return {
    days,
    availableMinutes,
    prerequisiteMinutes,
    targetMinutes,
    totalMinutes,
    marginMinutes: availableMinutes - totalMinutes,
    percent: totalMinutes === 0 ? 0 : Math.min(100, Math.round((availableMinutes / totalMinutes) * 100)),
    isPast: rawDays <= 0,
  };
}

export function validatePlan(value: unknown): Plan {
  if (!value || typeof value !== 'object') throw new Error('That file does not contain a sprint map.');
  const item = value as Partial<Plan>;
  if (item.version !== 1 || typeof item.target !== 'string' || typeof item.targetDate !== 'string') {
    throw new Error('This sprint map uses an unsupported format.');
  }
  if (!Array.isArray(item.prerequisites) || !Array.isArray(item.exercises)) {
    throw new Error('This sprint map is missing its lanes.');
  }
  const validPrereqs = item.prerequisites.every((node) =>
    node && typeof node.id === 'string' && typeof node.title === 'string' &&
    typeof node.minutes === 'number' && typeof node.required === 'boolean' &&
    typeof node.known === 'boolean' && typeof node.done === 'boolean',
  );
  const validExercises = item.exercises.every((node) =>
    node && typeof node.id === 'string' && typeof node.title === 'string' &&
    typeof node.minutes === 'number' && typeof node.done === 'boolean',
  );
  if (!validPrereqs || !validExercises) throw new Error('Some lane items are invalid.');
  return {
    version: 1,
    target: item.target,
    targetDate: item.targetDate,
    hoursPerWeek: clampNumber(item.hoursPerWeek, 0.5, 80, 5),
    sessionMinutes: clampNumber(item.sessionMinutes, 10, 240, 30),
    assumption: typeof item.assumption === 'string' ? item.assumption : '',
    prerequisites: item.prerequisites.map((node) => ({ ...node, minutes: clampNumber(node.minutes, 5, 10_000, 30) })),
    exercises: item.exercises.map((node) => ({ ...node, minutes: clampNumber(node.minutes, 5, 10_000, 30) })),
  };
}

export function completion(plan: Plan): { completed: number; total: number; targetStarted: boolean } {
  const all = [...plan.prerequisites, ...plan.exercises];
  return {
    completed: all.filter((item) => item.done || ('known' in item && item.known)).length,
    total: all.length,
    targetStarted: plan.exercises.some((item) => item.done),
  };
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date(0);
  return new Date(year, month - 1, day);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
