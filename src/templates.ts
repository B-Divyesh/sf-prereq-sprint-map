import type { Plan } from './model';
import { datePlusDays } from './model';

export type SubjectTemplate = {
  id: string;
  label: string;
  plan: Plan;
};

const makePlan = (target: string, assumption: string, prerequisites: Plan['prerequisites'], exercises: Plan['exercises']): Plan => ({
  version: 1,
  target,
  targetDate: datePlusDays(14),
  hoursPerWeek: 5,
  sessionMinutes: 30,
  assumption,
  prerequisites,
  exercises,
});

export const templates: SubjectTemplate[] = [
  {
    id: 'data-structures',
    label: 'Data structures',
    plan: makePlan(
      'Data structures',
      'Assumes you can run small programs in one language. Discrete math can be learned alongside; this is a starting hypothesis, not universal advice.',
      [
        { id: 'ds-1', title: 'Trace variables, loops, and function calls', minutes: 45, required: true, known: false, done: false },
        { id: 'ds-2', title: 'Use arrays or lists and indexes', minutes: 45, required: true, known: false, done: false },
        { id: 'ds-3', title: 'Read basic Big-O comparisons', minutes: 60, required: false, known: false, done: false },
        { id: 'ds-4', title: 'Recall sets, relations, and simple proofs', minutes: 90, required: false, known: false, done: false },
      ],
      [{ id: 'ds-x1', title: 'Implement a stack, then use it to check balanced brackets', minutes: 60, done: false }],
    ),
  },
  {
    id: 'sql',
    label: 'SQL queries',
    plan: makePlan(
      'Write useful SQL queries',
      'Assumes access to a small practice database. Database administration and formal relational algebra are outside this first sprint.',
      [
        { id: 'sql-1', title: 'Recognize rows, columns, and primary keys', minutes: 30, required: true, known: false, done: false },
        { id: 'sql-2', title: 'Filter and sort tabular data', minutes: 45, required: true, known: false, done: false },
        { id: 'sql-3', title: 'Sketch one-to-many relationships', minutes: 45, required: false, known: false, done: false },
      ],
      [{ id: 'sql-x1', title: 'Answer one real question with SELECT, WHERE, and ORDER BY', minutes: 45, done: false }],
    ),
  },
  {
    id: 'git',
    label: 'Git collaboration',
    plan: makePlan(
      'Contribute with Git',
      'Assumes Git is installed and you can open a terminal. Advanced history rewriting is intentionally excluded.',
      [
        { id: 'git-1', title: 'Navigate folders in a terminal', minutes: 30, required: true, known: false, done: false },
        { id: 'git-2', title: 'Explain files, snapshots, and branches', minutes: 45, required: true, known: false, done: false },
        { id: 'git-3', title: 'Read a simple diff', minutes: 30, required: false, known: false, done: false },
      ],
      [{ id: 'git-x1', title: 'Clone a practice repo, make one commit, and open a mock pull request', minutes: 60, done: false }],
    ),
  },
];
