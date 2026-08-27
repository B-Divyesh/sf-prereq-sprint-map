# Independent verification — FAIL

Verified 2026-08-27 for work order `prereq-sprint-map-verify-2`.

- Candidate commit: `a648b567c6efefc3419118efcca28d31c62bf6d2`
- Clean checkout: fresh detached clone at that exact commit in `/tmp/prereq-sprint-map-qa`
- Production URL: <https://prereq-sprint-map.sociobot.in>
- Product class: static web/PWA

## Result

**FAIL.** The repaired validation behavior and deployed artifact are correct, and every functional, privacy, PWA, response-policy, and serious/critical axe check passed. The candidate nevertheless fails the supplied mobile accessibility/design acceptance criterion requiring 44×44 CSS-pixel touch targets. Five visible controls are smaller than that at the required 390px viewport. No product code was changed by this verification.

## Quality gates and evidence

| Area | Fresh evidence | Result |
| --- | --- | --- |
| Clean install | Fresh clone followed by `npm ci`; 59 packages installed; audit reported 0 vulnerabilities. | Pass |
| Tests | `npm test`: 14/14 Vitest tests passed. | Pass |
| Types/build | Exact production command `npm run build` passed (`tsc --noEmit` plus Vite) and created `dist/`. No separate lint script exists. | Pass |
| Production budget | JS `26,704` bytes / `9,270` gzip (limit 200 KB); CSS `13,583` / `3,910` gzip (limit 50 KB); no web fonts; mobile hero WebP `50,144` bytes and desktop WebP `200,810` bytes (each within 300 KB). | Pass |
| Core user journey | On local and live production builds: empty-name recovery and focus restoration; Data structures editable template and stated assumption; diagnostic removes a prerequisite estimate; target exercise completion changes the start-now checkpoint while optional work remains; add/reorder/remove/Undo; confirmed and cancelled clear; JSON export; persisted reload. | Pass |
| Boundary/error recovery | New 4-minute estimate clamps to 5; new 10,001-minute estimate clamps to 10,000; valid 2028-02-29 import succeeds; import clamps weekly/session/estimate bounds; malformed JSON and invalid calendar-date imports give recovery guidance and preserve saved work. Project smoke also passed the invalid `2026-02-30` no-persistence case. | Pass |
| Desktop/mobile/keyboard | 1440px desktop and 390px mobile have no horizontal overflow; target lane is ordered first on mobile. Tab reaches the skip link first; its focus ring computes to solid 3px moss; Enter activates the skip target, adds a target task, reorders a prerequisite, and restores removed work. | Pass except P2 below |
| Motion and a11y | `prefers-reduced-motion` computes a transition duration at or below 0.01s. `npm run audit:a11y` reported 0 violations / 0 serious or critical locally and live. Custom 390px axe run likewise had 0 serious/critical findings. Semantics verified: title, `lang=en`, exactly one `h1`, `main`, image alt text, and no page/console errors. | Pass except P2 below |
| Privacy/outbound | Runtime request capture on local and live builds contained only the respective same origin (HTML, hashed JS/CSS, hero image). Static review confirms no remote fonts, APIs, analytics, or trackers; plan data is localStorage only, consistent with `/privacy`. | Pass |
| PWA | Live worker registered and controlled `/sw.js`; `registration.update()` resolved with no waiting worker; current cache contains `/`, `index.html`, manifest, icon, both hero assets, and current hashed JS/CSS. Project smoke and an independent live test both completed an offline reload with `main` present and no errors. | Pass |
| Deployment parity | Local and live files were byte-identical: `index.html` SHA-256 `c246ee6fc4f532297ccfd99e0abb9f0bee4d921de7910545126f92de78129bd3`; JS `e6b3ba1636ed8fc9d09156a4734b6401b74d70208f62e4c8543328169c833fb1`; CSS `2618fb3816f01e4f7ef995e92b1fb36903066ea7b4214ff401d95313219644fe`; worker `0de01046b19702ee4c33e8acd1a50da3e6a959117630fb59f6612be05d184794`. | Pass |
| Live policies/caching | HTTPS responses include HSTS, CSP restricted to `'self'`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denied. Hashed assets are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`; HTML is `public, must-revalidate, max-age=30`. | Pass |

Lighthouse was attempted twice against the live URL using downloaded Chrome for Testing: first Chrome discovery failed; then Chrome launched but Lighthouse reported a browser-tab crash before a report was emitted. Therefore no Lighthouse score is claimed. This verifier-environment limitation is not the failure basis; direct browser, axe, budget, layout, response-policy, and PWA checks above completed.

## Defects

### P2 — Required 44×44px mobile touch targets are not met

At the requested 390×844px viewport on the exact live candidate, the following visible interactive targets were measured with `getBoundingClientRect()` below 44px in at least one dimension:

| Control | Measured size |
| --- | --- |
| Wordmark/home link | 190 × 37.5px |
| Import JSON label-button | 106.58 × 40px |
| Export JSON button | 106.58 × 40px |
| Clear map button | 106.70 × 40px |
| Terms footer link | 38.53 × 44px |

This violates the supplied design-principles and accessibility contract: “Touch/click targets ≥ 44×44 CSS px.” The compact file-action controls use a 40px minimum height, and text-only links have no minimum target width/height. The problem makes mobile activation less reliable and blocks acceptance even though keyboard operation and axe serious/critical checks pass.

## Regression result relative to verification-1

The two earlier P2 defects are fixed in this candidate: 10,001-minute new nodes are now clamped to 10,000, and malformed calendar dates are rejected without a success announcement or local-storage overwrite. The prior deployment concern is also resolved: the public site now serves the exact candidate bytes.

## Re-run

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
node scripts/smoke.mjs
npm run audit:a11y -- http://127.0.0.1:4173
```

After increasing every visible interactive target to at least 44×44px at 390px, rerun the measured mobile-control audit, local/live browser checks, and deployment-parity hashes.
