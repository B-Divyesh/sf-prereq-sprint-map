# Handoff — Prerequisite Sprint Map repair

## Status: repaired and verified

Repair work order: `prereq-sprint-map-repair-1`
Base: `65dd64fdb5310487ed7809b8b01728786e4e76a9` (independent-report commit)
Candidate identified by the report: `59c4838dbaa665a00531131b66b8bafe1fef5780`
Date: 2026-08-27

## What changed

- Added one model-level estimate clamp for the declared 5–10,000 minute contract. New prerequisite and target-exercise flows, existing edits, and imports now all use it, so a new value of `10001` persists and contributes to capacity as `10000`.
- Added strict `YYYY-MM-DD` calendar-date validation to import validation, including month bounds and leap years. Values such as `not-a-date`, `2026-02-30`, and non-zero-padded dates are rejected before assignment, local-storage persistence, or the import-success announcement.
- Added model boundary regressions for the estimate limit, import estimate normalization, malformed/non-leap dates, and a valid leap day.
- Extended the production browser smoke test to exercise both new-node limit paths and verify that an invalid imported date neither announces success nor overwrites saved data.

Capacity arithmetic itself was not changed; its original day-count, availability, and completed/known-work behavior remains covered by tests.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
npm run audit:a11y -- http://127.0.0.1:4173
node scripts/smoke.mjs
```

Required deploy directory: `dist/` (static site; `index.html` is at its root).

## Verification recorded

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed; 0 vulnerabilities reported |
| Model regressions | `npm test`: 14/14 passed |
| Type check and production build | `npm run build` passed and generated `dist/` |
| New estimate boundaries | Browser smoke verified new prerequisite and exercise values of `10001` render as `10000` |
| Invalid import recovery | Browser smoke verified `2026-02-30` has an explanatory error, no success copy, and no local-storage change |
| Local browser/offline/PWA | `node scripts/smoke.mjs` passed: template, diagnostics, target completion, bounded estimates, invalid-date recovery, persistence, service-worker offline shell, and legal route |
| Accessibility | Local axe: 0 violations (0 serious/critical); `verify-url.sh` found title, `lang=en`, one `h1`, main landmark, image alt text, no unlabeled buttons, and no console/page errors |
| Live URL baseline | `https://prereq-sprint-map.sociobot.in` returned 200; live axe had 0 violations and URL verification had no console/page errors before this repair was submitted for static deployment |
| Performance budget | Production JS: 26.70 KB raw / 9.27 KB gzip; CSS: 13.58 KB raw / 3.91 KB gzip; no web fonts. All are within the static-product budgets. |

The repair does not change the concrete-and-moss visual system, original image provenance, keyboard handling, reduced-motion policy, privacy posture, or local-first PWA design.

## Known limits / next steps

- No accounts, tracking, cloud sync, or remote learner data are used; maps remain in browser local storage and can be exported as JSON.
- Templates remain explicitly bounded starting points, not universal prerequisite claims.
- After the standard static deployment completes, repeat the live regression path for the two repaired validation cases as part of release monitoring.
