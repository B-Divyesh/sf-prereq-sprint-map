# Handoff — Prerequisite Sprint Map repair 2

Repair work order: `prereq-sprint-map-repair-2`
Verifier report: `.factory/verification-2.md` at `cedb31e14db3c6f2a3d4fedbb4c9e2892fe7905e`
Candidate under repair: `a648b567c6efefc3419118efcca28d31c62bf6d2`

## What changed

- Repaired the five 390px touch targets reported by independent QA without changing the planner's behavior or visual direction.
  - The wordmark/home link is now an inline-flex control with a 44px minimum height and width.
  - Header and footer links have a 44px minimum width as well as height, so the short “Terms” link is reliably tappable.
  - Compact file controls and the text-only “Clear map” action no longer override the global 44px control minimum with a 40px height.
- Added an exact browser regression to `scripts/smoke.mjs`. At the required 390×844 viewport it measures the wordmark, Import JSON label-button, Export JSON, Clear map, and Terms link and fails below 44×44px before continuing through the existing user journey.

The concrete-and-moss system, local-first storage, data validation repairs, PWA behavior, keyboard behavior, responsive lane ordering, original image asset, and static Azure deployment class are unchanged.

## Local verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
node scripts/smoke.mjs
npm run audit:a11y -- http://127.0.0.1:4173
```

Results on 2026-08-27:

| Check | Evidence | Result |
| --- | --- | --- |
| Clean install | `npm ci`: 59 packages installed; 0 vulnerabilities | Pass |
| Unit/type/build | `npm test`: 14/14; `npm run build` (`tsc --noEmit` + Vite) | Pass |
| Static output/budget | `dist/` contains root `index.html`; JS 26.70 KB raw / 9.27 KB gzip; CSS 13.61 KB raw / 3.91 KB gzip; no web fonts | Pass |
| Exact mobile regression | 390px: wordmark 190×44; Import 106.58×44; Export 106.58×44; Clear 106.70×44; Terms 44×44 CSS px | Pass |
| Core browser/PWA | `node scripts/smoke.mjs`: target workflow, diagnostics, add/reorder/remove/Undo, estimate/date recovery, persistence, offline reload, legal route | Pass |
| Desktop/mobile/keyboard | 1440px and 390px no horizontal overflow; skip link is first Tab target and Enter reaches `main`; no page or console errors | Pass |
| Accessibility | `npm run audit:a11y -- http://127.0.0.1:4173`: 0 axe violations (0 serious/critical); reduced motion, landmarks, title/lang/one h1, labels, focus styling remain in place | Pass |
| Privacy | Browser request capture after load/reload: only `http://127.0.0.1:4173`; static scan found no remote fonts, APIs, analytics, or trackers | Pass |
| Lighthouse attempt | Lighthouse 12.8.2 was attempted against the local production server with downloaded Chrome for Testing. Chrome could not accept the DevTools connection (`Unable to connect to Chrome`), so no score is claimed. Direct Playwright, axe, budget, semantic, layout, and PWA checks above passed. | Environment limitation |

There is no separate lint script or package/consumer artifact for this Vite static web product; the build's TypeScript `--noEmit` check is the available type gate.

## Deploy and post-deploy verification

Deploy `dist/` to the existing Azure Static Web App `sf-prereq-sprint-map` in resource group `sociobot`, production environment. The deploy and live identity/response-policy evidence will be recorded here after the deployment completes.

## Known limits

- Plans stay in browser local storage and can be exported as JSON; there are no accounts, tracking, cloud sync, payments, or remote learner-data collection.
- Examples are explicitly editable starting hypotheses, not universal prerequisite claims.
