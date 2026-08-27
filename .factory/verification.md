# Independent verification — FAIL

Verified 2026-08-27 for work order `prereq-sprint-map-verify-1`.

- Candidate commit: `59c4838dbaa665a00531131b66b8bafe1fef5780`
- Live URL: <https://prereq-sprint-map.sociobot.in>
- Checkout: fresh detached worktree at the candidate commit, with a fresh `npm ci`.

## Result

**FAIL.** The production build, deployed artifact, ordinary workflow, accessibility, privacy, and PWA smoke checks pass, but two input-validation defects let malformed or out-of-contract planning data be accepted and persisted. The product should not be promoted until they are corrected and reverified.

## Checks completed

| Area | Evidence | Result |
| --- | --- | --- |
| Install, tests, types, build | `npm ci`; `npm test` = 6/6 Vitest tests; exact `npm run build` (includes `tsc --noEmit`) passed and produced `dist/`. No separate lint script exists. | Pass |
| Budget | Built JS `26,364` bytes / `9,110` gzip; CSS `13,583` / `3,910` gzip; system fonts 0 bytes; responsive hero WebP 50,144 bytes at 720px and 200,810 bytes at 1280px. | Pass |
| Core journey | Empty map; Data structures example and its stated assumption; diagnostic check; completion of a target exercise while optional prerequisites remain; capacity changes; add/reorder/remove/Undo; clear/load recovery; local-storage reload; JSON export/import. | Pass except defects below |
| Error/recovery | Empty node name gives actionable feedback; syntactically invalid JSON and missing lanes give actionable import feedback; import can be retried. | Pass |
| Keyboard and responsive | Tab-only controls work; tested visible focus ring was `solid 3px rgb(51, 93, 57)`; desktop 1440px and mobile 390px had no horizontal overflow; target lane precedes prerequisites on mobile. | Pass |
| Accessibility | `npm run audit:a11y` on local production build and live URL: 0 axe violations (0 serious/critical). Browser checks found one `h1`, one `main`, title, `lang=en`, image alt text, no console/page errors. Reduced motion computes `0.01s`. | Pass |
| PWA | Worker registered/controlled `/sw.js`; no-change `registration.update()` resolved; after worker activation and a normal reload, an offline reload rendered `main`. Existing `scripts/smoke.mjs` also passed its offline flow. | Pass |
| Privacy/outbound | Static scan and live request capture found only same-origin runtime requests. No remote fonts, APIs, analytics, or trackers; localStorage is the only app data store, matching `/privacy`. | Pass |
| Deployment parity | Live `index.html`, `index-t-gTeZQW.js`, `index-DAc_LROr.css`, `sw.js`, and manifest match the candidate production build byte-for-byte (JS SHA-256 `b1dc78…a9a6fbf`, CSS `2618fb…19644fe`). | Pass |
| Live transport/caching | HTTPS response has HSTS, CSP restricted to self, `nosniff`, referrer and permissions policies. Hashed JS/CSS are `max-age=31536000, immutable`; service worker is `no-cache`; HTML is `max-age=30`. | Pass |

Lighthouse CLI could not be independently run in this container: its first run lacked a discoverable browser; with Playwright Chromium supplied it crashed its tab before producing a report. This is a verifier-environment limitation, not counted as a product failure. The concrete bundle, layout, axe, browser-error, and live checks above were completed.

## Defects

### P2 — New-node minutes ignore the advertised 10,000-minute maximum

Reproduction on the exact production build:

1. Load the Data structures example.
2. Enter any target exercise title.
3. Enter `10001` in “Minutes” and choose **Add exercise**.

The new node is created with `10001` minutes (not clamped to the control's declared maximum of 10,000); capacity reports a distorted 166h 41m of target work. The same missing upper clamp exists in the new-prerequisite path. Existing-node edits and imports do clamp to 10,000, so behavior is inconsistent. This corrupts the deadline capacity calculation central to the product's job.

### P2 — Import accepts an invalid target date as a successful map

Import this otherwise schema-shaped JSON:

```json
{"version":1,"target":"x","targetDate":"not-a-date","hoursPerWeek":5,"sessionMinutes":30,"assumption":"","prerequisites":[],"exercises":[]}
```

The UI announces “Map imported and saved on this device.”, persists it, renders the date control blank, and only later shows the non-specific capacity text “Choose today or a future date.” `validatePlan` checks that `targetDate` is a string but does not validate a calendar date. Invalid imports must be rejected with an explanatory recovery message, rather than acknowledged as successfully saved.

## Visual review

Desktop and 390px mobile screenshots were inspected. The concrete/moss system, editorial image, two-lane emphasis, and small-screen ordering match the design thesis and support the anti-paralysis workflow. The only visual issue observed was the expected downstream capacity distortion from the P2 over-limit input.

## Re-run

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
npm run audit:a11y -- http://127.0.0.1:4173
node scripts/smoke.mjs
```

After fixing the two P2 validation defects, repeat the boundary and malformed-import cases above plus the live parity check.
