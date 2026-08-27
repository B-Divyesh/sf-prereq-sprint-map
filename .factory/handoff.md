# Handoff — independent verification 4: PASS

**Final QA verdict: PASS** for candidate `ffadfcc2ef9dd1c5cc19d8660b18d7e071eea1b2` at <https://prereq-sprint-map.sociobot.in>.

Independent clean-checkout verification found no release-blocking defects. `npm ci`, 14/14 unit tests, typecheck/production build, local and live browser smoke, axe, desktop/390px keyboard/mobile tests, service-worker offline/update tests, policy/cache checks, and mobile Lighthouse all passed. The deployed HTML, JS, CSS, worker, manifest, icon, and image assets byte-match the fresh `dist/` build. See [.factory/verification-4.md](verification-4.md) for exact commands, measurements, hashes, and severity assessment.

No product code was changed during this verification. No known gaps or defects remain from this QA pass.

---

# Handoff — repair 3: controls restored

Repair work order: `prereq-sprint-map-repair-3`
Verifier report repaired: `.factory/verification-3.md` at `e72789c55cf36f4548b0070718d18d315f489535`
Original candidate: `019b26683d2c56c0ea242a4a6df18a5c10b785e3`
Repair commit: `225377d fix: restore accessible planner controls`
Live URL: <https://prereq-sprint-map.sociobot.in>

## What changed

Both release-blocking P2 accessibility defects from independent verification 3 are repaired without changing the planner's researched job, template assumptions, local-first storage model, PWA behavior, or concrete-and-moss visual system.

- Populated prerequisite and target estimate controls now have a `44px` minimum height. The 76px-wide controls are therefore at least 76×44 CSS px at 390px.
- Import is now a real, labeled `<button type="button">` in the keyboard order. Activating it with Enter opens the same native JSON file chooser. The programmatic file input remains visually hidden, is removed from the Tab order with `tabindex="-1"`, and is hidden from the accessibility tree; import validation and recovery behavior are unchanged.
- `scripts/smoke.mjs` now has exact 390×844 regressions for prerequisite and target minute-field dimensions, the visible 3px focus state on Import JSON reached by actual Tab traversal, Enter activation of its file chooser, and the next Tab stop being Export JSON rather than the hidden native input.
- Playwright is pinned to `1.58.2`, matching the preinstalled browser used for browser verification.

## Clean local verification

Run from a clean checkout:

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
node scripts/smoke.mjs
npm run audit:a11y -- http://127.0.0.1:4173
```

Results recorded on 2026-08-27:

| Check | Evidence | Result |
| --- | --- | --- |
| Clean install | `npm ci` installed 60 packages; audit found 0 vulnerabilities. | Pass |
| Unit/type/build | `npm test`: 14/14 Vitest tests passed. `npm run build` ran `tsc --noEmit` and Vite successfully. No separate lint command exists in this static TypeScript product. | Pass |
| Artifact/budget | `dist/index.html` exists at root. JS 26,818 bytes / 9,290 gzip (≤200 KB); CSS 13,608 / 3,910 gzip (≤50 KB); no web fonts; hero WebPs 50,144 and 200,810 bytes (each ≤300 KB). | Pass |
| Exact control regressions | Browser smoke at 390×844 measured both populated lane minute controls at least 44×44, reached Import JSON by Tab with a 3px visible focus outline, opened its native chooser with Enter, skipped the hidden file input, and reached Export JSON next. | Pass |
| Core and recovery flow | Smoke loaded Data structures, diagnosed a skill, completed target work with optional work left, added with Enter, clamped both 10,001-minute additions, rejected and did not persist an invalid calendar-date import, persisted a valid map, and loaded the offline shell. | Pass |
| Browser desktop/mobile/keyboard | Production-bundle Playwright checks at 1440×900 and 390×844 found no horizontal overflow, errors, or console errors; title/lang/one h1/one main/image alt passed. The skip link was first Tab stop and Enter produced `#main`; reduced motion was `1e-05s`. | Pass |
| Accessibility | `npm run audit:a11y -- http://127.0.0.1:4173`: 0 violations, 0 serious/critical. | Pass |
| Privacy | Runtime capture contained only `http://127.0.0.1:4173`; static review found no remote runtime scripts, fonts, APIs, analytics, or trackers. | Pass |
| PWA/update | Local worker controlled the app; `registration.update()` completed with no waiting worker; cache was `prereq-sprint-map-v1`; the smoke offline reload retained `main`. | Pass |
| Lighthouse mobile | Lighthouse 12.8.2 attached to a manually launched Playwright Chromium: Performance 99, Accessibility 100, Best Practices 100, SEO 100. | Pass |

There is no package/consumer artifact beyond this Vite static application, and no separate lint script; the TypeScript check in `npm run build` is the available type gate.

## Deployment and live verification

Deployed the existing static product with:

```sh
swa deploy dist --env production --app-name sf-prereq-sprint-map --resource-group sociobot --swa-config-location dist --no-use-keychain
```

| Check | Live evidence | Result |
| --- | --- | --- |
| Deployment identity | SHA-256 matched local `dist/` exactly for `index.html` (`b7adaf779f50…241666c08`), JS (`c8d3dd333fec…e8fd1e3d7`), CSS (`cf84b7b177ef…278246549`), worker (`0de01046b197…05d184794`), manifest, and both WebP assets. | Pass |
| Live workflow and mobile regression | `node scripts/smoke.mjs https://prereq-sprint-map.sociobot.in` passed the exact 390px touch, Tab/focus, file-chooser, core flow, validation, persistence, and offline checks. | Pass |
| Live accessibility | `npm run audit:a11y -- https://prereq-sprint-map.sociobot.in` reported 0 violations, including 0 serious/critical. | Pass |
| Live browser/privacy | Playwright at desktop and 390px found no page or console errors, no overflow, correct title/lang/one h1/one main/alt text, and only `https://prereq-sprint-map.sociobot.in` runtime requests. | Pass |
| Live PWA/update | The registered worker controls the page; `registration.update()` completed without a waiting worker; cache is `prereq-sprint-map-v1`. | Pass |
| Live response policy/cache | HTTPS responses include HSTS, self-only CSP, `nosniff`, strict-origin referrer policy, and denied camera/microphone/geolocation. Hashed JS/CSS are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`; HTML is `public, must-revalidate, max-age=30`. | Pass |

## Known limits

- Plans stay only in browser local storage unless exported. There are no accounts, tracking, cloud sync, payments, or remote learner-data collection.
- Templates are explicitly editable starting hypotheses, not universal prerequisite claims.
