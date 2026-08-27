# Independent verification 3 — FAIL

Verified 2026-08-27 for work order `prereq-sprint-map-verify-3`.

- Candidate: `019b26683d2c56c0ea242a4a6df18a5c10b785e3` (`docs: record PWA update check`)
- Checkout: clean `/work/repo` checkout at that exact commit before verification; no product source was changed.
- Local production URL: `http://127.0.0.1:4173`
- Production URL: <https://prereq-sprint-map.sociobot.in>
- Product class: static web/PWA

## Result

**FAIL.** The deployed product exactly matches the candidate and the planner's normal, boundary, invalid-input, privacy, PWA, policy, budget, and serious/critical axe checks pass. It still misses two mandatory mobile/keyboard accessibility requirements: visible per-node minute controls are only 40px tall, and the Import JSON file control receives invisible keyboard focus. These violate the supplied 44×44px touch-target and visible-focus contracts.

## Evidence

| Area | Fresh evidence | Result |
| --- | --- | --- |
| Clean install | `npm ci` installed 59 packages; audit reported 0 vulnerabilities. | Pass |
| Unit/type/build | `npm test`: 14/14 Vitest tests passed. `npm run build` passed (`tsc --noEmit` + Vite) and produced `dist/`. There is no separate lint script. | Pass |
| Production size | Vite: JS 26,704 bytes / 9,270 gzip (200KB limit); CSS 13,608 / 3,910 gzip (50KB limit); no web fonts; mobile/desktop WebP 50,144 / 200,810 bytes (each below 300KB). | Pass |
| Lighthouse | Fresh local mobile Lighthouse with the Playwright-installed Chromium: Performance 98, Accessibility 100, Best Practices 100, SEO 100. | Pass |
| Core learner flow | Local and live: loaded the editable Data structures template (4 prerequisites, 1 target exercise and an explicit non-universal assumption); marked a known prerequisite; completed target work while optional prerequisites remained; checkpoint announced the anti-paralysis result; added/reordered with keyboard Enter, removed/Undo restored, and persistence/offline reload passed. | Pass |
| Boundary and recovery | Empty target exercise gives a clear message and returns focus to its field. New 4-minute and 10,001-minute estimates clamp to 5 and 10,000. Weekly capacity 0 clamps to 0.5; session 241 clamps to 240. Valid 2028-02-29 import succeeds and clamps imported capacity values. Malformed JSON and invalid `2026-02-30` imports provide recovery text and preserve stored work. Confirm-cancelled template replacement preserved the plan; confirmed clear reset it. | Pass |
| Responsive/keyboard | At 1440px and 390px there is no horizontal overflow; at 390px the target lane precedes prerequisites. Skip link is first Tab stop with a 3px focus outline; reduced-motion transition duration is `1e-05s`. All tested buttons, fields, node toggles and move-up keyboard action operate, except the Import focus defect below. | Fail — P2 |
| Accessibility | `npm run audit:a11y -- http://127.0.0.1:4173` and the identical live command each reported 0 violations, including 0 serious/critical. Both root and legal routes have `lang=en`, correct title, one `h1`, and one `main`; image has descriptive alt text. | Pass except P2 below |
| Console/page errors | Fresh local and live Playwright runs recorded no page errors or console errors. | Pass |
| Privacy/outbound | Runtime capture on both URLs saw only their own origin. Static review found no remote fonts, scripts, API calls, analytics, or trackers; plan data uses browser localStorage and the privacy page accurately states this. | Pass |
| PWA | Local and live worker is registered and controlling the page; `registration.update()` completed with no waiting worker and cache `prereq-sprint-map-v1`. `node scripts/smoke.mjs` completed an offline reload with `main` present. | Pass |
| Live deployment identity | Local `dist/` and live files have equal SHA-256: HTML `5842c2d0c30…416ddbc12`; JS `742a85eac0ad…d3faa6b179`; CSS `e8967f01abcc…c4e3a32aa`; worker `0de01046b197…05d184794`; both hero WebPs and manifest also match. | Pass |
| Live response policy/caching | HTTPS responses include HSTS, self-only CSP, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Hashed JS/CSS are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`; HTML is `public, must-revalidate, max-age=30`. | Pass |

## Defects

### P2 — Per-node minute fields are 76×40px at the required mobile viewport

At 390×844px, after loading the normal Data structures template, every visible `.node .minutes-input` measured **76×40px** locally and live. This includes prerequisite and target estimate fields. The product's CSS explicitly sets `.minutes-input { min-height: 40px; }`, below the required 44px minimum. The add-row minute controls happen to be 46.8px tall, but the existing item controls are not.

This violates the supplied design/accessibility contract: “Touch/click targets ≥ 44×44 CSS px.” It affects the primary editable estimate controls in the planner.

### P2 — Import JSON has an invisible keyboard focus stop

At both desktop and 390px, Tab proceeds from “Build my sprint” to `input#import-file`. It is a focusable native file input styled with `.visually-hidden`: its measured box is **1×44px**, `clip: rect(0px, 0px, 0px, 0px)`, and its otherwise-correct 3px focus outline is clipped. The visible “Import JSON” label is not itself a keyboard focus target.

This violates the supplied keyboard requirement that every interactive element has a visible focus state, as well as the 44px touch-target requirement. A keyboard-only user cannot see where focus went before invoking the file picker.

## Re-run

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
node scripts/smoke.mjs
npm run audit:a11y -- http://127.0.0.1:4173
```

After increasing all per-node estimate controls to at least 44px and making Import JSON a genuinely focusable, visibly focused control (or otherwise avoiding an invisible Tab stop), rerun the 390px all-control sweep, keyboard Tab sequence, local/live smoke, axe, and deployment-hash checks.
