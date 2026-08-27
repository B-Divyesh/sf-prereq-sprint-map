# Prerequisite Sprint Map

Prerequisite Sprint Map helps a learner escape prerequisite paralysis. It turns a target topic, deadline, and weekly capacity into a small editable contract with two parallel lanes: only the prerequisites that currently block progress, and a real target-topic exercise to attempt now.

Live: https://prereq-sprint-map.sociobot.in

## Who it is for

Learners starting a technical subject who need a bounded way to decide what to learn first without mistaking a broad curriculum for a mandatory gate. Included templates are editable hypotheses and state their assumptions; they are not universal educational advice.

## What it does

- Calculates available minutes and sessions through a target date.
- Keeps required and optional prerequisites distinct.
- Removes diagnosed skills from the time estimate without erasing them.
- Keeps target-topic work visible beside foundation work.
- Saves only to browser local storage and imports/exports portable JSON.
- Installs as a small offline-capable PWA after the first production visit.

## Develop and verify

Requires Node.js 20 or later.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The exact production build command is `npm run build`. Output lands in `dist/`, with `dist/index.html` at its root. Azure Static Web Apps navigation fallback and security headers are included in `public/staticwebapp.config.json`.

## Product and visual documentation

The researched product contract is in `.factory/brief.json`; the palette, typography, interaction system, motion policy, asset prompt, and generated-image provenance are in `.factory/design.md`.

## Privacy

There are no accounts, trackers, remote APIs, or third-party runtime assets. Plan content stays in local storage unless the learner exports and shares it. See `/privacy` in the app.

## License

MIT. See `LICENSE`.
