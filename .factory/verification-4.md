# Independent verification 4 — PASS

**Candidate:** `ffadfcc2ef9dd1c5cc19d8660b18d7e071eea1b2`  
**Verified:** 2026-08-27  
**Live URL:** <https://prereq-sprint-map.sociobot.in>  
**Scope:** clean production build and independent deployed static-web QA against the researched brief and factory contract. No product code was modified.

## Verdict

**PASS.** The live deployment is the tested candidate build and the product meets the bounded prerequisite-planning job: editable prerequisite and target-work lanes, diagnostic checks, date/capacity math, and a visible start-now checkpoint all worked end to end. No P0–P3 defects were found.

## Clean checkout / build gates

| Check | Fresh evidence | Result |
| --- | --- | --- |
| Candidate state | Clean checkout began at exactly `ffadfcc2ef9dd1c5cc19d8660b18d7e071eea1b2`. | Pass |
| Install | `npm ci`: 60 packages installed; `npm audit` reported 0 vulnerabilities. | Pass |
| Unit tests | `npm test`: Vitest `src/model.test.ts`, 14/14 passed. | Pass |
| Type / exact production build | `npm run build` ran `tsc --noEmit` then Vite successfully; `dist/index.html` exists. No separate lint command is defined. | Pass |
| Bundle budgets | Built JS 26,818 B (9,290 B gzip), CSS 13,608 B (3,910 B gzip), no web fonts; mobile/desktop WebP assets are 50,144 B / 200,810 B. All meet the stated static-product budgets. | Pass |

## Functional, recovery, and PWA evidence

Ran the repository 390×844 Playwright smoke locally and against the live URL, plus independent Playwright coverage at 1440×900 and 390×844.

- Loaded an editable SQL/Data Structures template; verified prerequisite and target lanes, assumptions, capacity figures, and target-work checkpoint.
- Diagnosed a prerequisite, changed a required blocker to optional, completed target work while optional work remained, and saw the start-now success state.
- Added items using mouse and Enter; blank target input produced an actionable recovery message and returned focus to the field.
- Verified min/max estimate boundaries: `1` clamps to `5`; `10001` clamps to `10000`. Invalid imported calendar dates were rejected and did not overwrite saved state.
- Verified local persistence, remove + Undo, prerequisite reordering, clear/import/export controls, and confirmation behavior covered by the smoke suite.
- At 390px each inspected control was at least 44×44px; no horizontal overflow occurred. The mobile layout intentionally stacks target work before prerequisites.
- Keyboard-only checks: Skip link was the first Tab stop, had a 3px visible focus outline, navigated to `#main`, Import JSON was reachable/activated with Enter, and the hidden file input was not in the Tab order.
- With reduced motion emulated, transition duration was `1e-05s`.
- The registered PWA worker controlled the page, cache was `prereq-sprint-map-v1`, offline reload retained `<main>`, and `registration.update()` completed with no waiting worker.
- Desktop/mobile browser checks reported no page errors or console errors. `/privacy` and `/terms` each render one `<h1>` and one `<main>`.

## Accessibility, privacy, performance, and response policy

| Check | Evidence | Result |
| --- | --- | --- |
| Semantics / a11y | HTML `lang=en`, title, one h1, one main, image alt text, skip link, labelled controls, visible focus, and no overflow verified in browser. | Pass |
| axe | `npm run audit:a11y -- <local URL>` and the same against live both reported 0 violations; 0 serious/critical. | Pass |
| Visual review | Independently inspected rendered desktop and 390px screenshots. The concrete/moss system is legible, preserves hierarchy, and the narrow layout remains usable. | Pass |
| Lighthouse mobile | Lighthouse 12.8.2 against live (mobile): Performance 95, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0. | Pass |
| Privacy / outbound traffic | Static review found only browser `localStorage` and same-origin service-worker fetches. Browser capture on both viewports made requests only to `https://prereq-sprint-map.sociobot.in`; no trackers, remote APIs, CDN fonts, or third-party assets. | Pass |
| Headers / cache | Live HTTPS has HSTS, self-only CSP, `nosniff`, strict-origin referrer policy, and a denied camera/microphone/geolocation permissions policy. HTML is `public, must-revalidate, max-age=30`; JS/CSS/images are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`. | Pass |

## Deployment identity

Fresh `dist/` bytes match live for `index.html`, the hashed JS and CSS, `sw.js`, manifest, icon, and both WebP assets. Representative SHA-256 evidence: index `b7adaf779f50e60703c37300f7594f35cf7f754f2e9bde70f552288241666c08`, JS `c8d3dd333fec7664ebc252a1060da14679fce5c3b0370af204954eae8fd1e3d7`, CSS `cf84b7b177ef6909bdf31abb2fa57b75a5aa7231891446dff82e122278246549`, and worker `0de01046b19702ee4c33e8acd1a50da3e6a959117630fb59f6612be05d184794`.

## Defects

None found. There is no library/CLI consumer artifact; this is a static PWA, so package-install checks do not apply.
