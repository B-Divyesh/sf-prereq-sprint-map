# Handoff — Prerequisite Sprint Map

Work order: `prereq-sprint-map-build-1`  
Completed: 2026-08-27

## What was built

- A production Vite + vanilla TypeScript static application in `dist/`.
- An editable sprint contract with target topic, date, weekly hours, session length, and explicit scope assumptions.
- Two concurrent lanes: real target-topic exercises (“Start now”) and bounded prerequisite nodes.
- Per-prerequisite required/optional classification, “I can do this” diagnostic, practiced state, estimates, keyboard-safe reordering, deletion, and 10-second Undo.
- Date-aware capacity math for days, available minutes/sessions, remaining prerequisite and target work, margin, and actionable over-capacity guidance.
- Three editable subject examples with assumption statements: data structures, SQL queries, and Git collaboration.
- A visible checkpoint celebrating a target exercise completed before optional prerequisites—the brief's success behavior.
- Local-only persistence, JSON import/export, confirmed reset, storage error recovery copy, and no accounts or analytics.
- Installable PWA shell with versioned caching, offline fallback, cache cleanup, and offline status.
- Responsive 390px-first lane ordering, print treatment, full keyboard controls, visible focus, reduced-motion handling, and semantic landmarks.
- Client-side `/privacy` and `/terms` pages plus Azure Static Web Apps navigation fallback, security headers, cache headers, robots file, and sitemap.
- A product-specific brutalist concrete-and-moss system documented in `.factory/design.md`.
- One original Azure OpenAI illustration. The source, generated prompt sidecar, responsive WebP derivatives, and provenance are retained; the mobile derivative is about 50 KB and desktop derivative about 200 KB.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview -- --port 4173
npm run audit:a11y -- http://127.0.0.1:4173
node scripts/smoke.mjs
```

Required build command: `npm run build`  
Deploy directory: `dist/` (contains `index.html` at its root)

Verification completed against the production build:

- `npm test`: 6/6 model tests pass.
- `npm run build`: passes strict TypeScript checks and Vite production build.
- Browser smoke: template load, diagnostic check, target completion, keyboard add, local persistence, offline shell, and legal route pass.
- Factory `verify-url.sh`: title present, `lang="en"`, exactly one h1, main landmark, all image alt text present, no unlabeled buttons, no console/page errors.
- Axe/Playwright at 390×844: 0 violations (therefore 0 serious/critical).
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.5s, CLS 0, Total Blocking Time 60ms. INP is not available in a no-interaction lab run; the 60ms TBT is well below the 200ms responsiveness budget.
- Initial application JavaScript: 26.36 KB raw / 9.11 KB gzip (budget ≤200 KB).
- CSS: 13.58 KB raw / 3.91 KB gzip (budget ≤50 KB).
- Fonts: 0 KB; system families only (budget ≤120 KB).
- Hero: 50 KB at 720px and 200 KB at 1280px (budget ≤300 KB mobile).

## Known scope limits

- The product intentionally does not generate curriculum, assess actual proficiency, host courses, or give credential advice; learner checks are self-diagnostics.
- Templates are narrow, assumption-labeled starting points rather than claims of universal sufficiency.
- Maps sync only through explicit JSON export/import. This is the privacy-first behavior requested by the brief; there is no account or cross-device cloud store.
- The service worker updates the cached shell on its next install/activation. A first production page load must finish once before offline use.

## Suggested next steps

- Test the success metric with consenting adult learners: target-exercise completion while any optional prerequisite remains open.
- Add community-reviewed JSON templates only after their assumptions, target exercise, and scope are editorially checked.
- Use field data—not added curriculum breadth—to tune default capacity and session estimates.
