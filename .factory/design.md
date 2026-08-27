# Visual thesis: brutalist concrete and moss

## Why this world fits

Prerequisite planning should feel bounded and physical, not like an infinite course catalogue. The interface is a workbench made from rough concrete: firm edges, numbered marks, and honest structure. Moss is the living signal that progress can start before the whole foundation is polished. The target-topic lane stays visible beside prerequisite work, reinforcing the product's core rule: touch the real subject now.

This is intentionally a single-mode, light treatment. The pale mineral ground is painted explicitly; forcing a generic dark theme would weaken the concrete-and-moss metaphor. Contrast remains AA throughout.

## Tokens

- `--concrete-0 #f2f0e8`: page ground, like chalky aggregate.
- `--concrete-1 #e5e1d5`: recessed panels and inactive tracks.
- `--concrete-2 #c8c3b5`: rules and secondary controls.
- `--charcoal #20231f`: primary ink.
- `--charcoal-muted #565c53`: secondary text (7:1+ on the ground).
- `--moss #335d39`: primary action and active state.
- `--moss-bright #b9d45a`: high-visibility marker used with text/shape, never alone.
- `--lichen #dce8b8`: selected and success surfaces.
- `--rust #9b3d27`: errors and destructive action.
- `--amber #8a5a09`: deadline warnings.
- Focus: a 3px `#335d39` outer ring plus a pale offset.

## Type

- Headings and utility labels: `Arial Black`, `Arial Narrow`, system sans-serif. Compressed, stamped, and infrastructural.
- Body and numbers: `ui-monospace`, `SFMono-Regular`, `Cascadia Mono`, `Roboto Mono`, monospace. Tabular figures make capacity arithmetic easy to scan.
- No downloaded fonts: this keeps the page private, fast, and visually honest.
- Scale: 14 / 16 / 20 / 28 / clamp(40–72) px; body never below 16px.

## Spacing and shape

- 4px base rhythm; primary steps are 8, 12, 16, 24, 32, 48, and 64px.
- Maximum workbench width 1180px. Text measure 68ch.
- Corners are 0–6px, borders 2px. Shadows are hard 4px offsets rather than soft elevation.
- Cards appear only for independent prerequisite nodes. Larger regions are separated by proximity and heavy rules.
- All controls have a 44px minimum target. At 390px, the two planning lanes stack, while the target lane is ordered first after the capacity strip.

## Interaction grammar

- Nodes behave like material tickets: diagnostic toggles punch a square mark; drag controls are replaced by explicit up/down buttons for dependable keyboard use.
- Required/optional is stated in words and repeated with border treatment.
- Completing a target exercise adds a bright moss notch to the shared progress rail and updates the start-now checkpoint immediately.
- Destructive removal provides a timed Undo action. Template replacement requires explicit confirmation when it would overwrite work.
- Empty states always point to either “Add prerequisite” or “Load example”. Storage errors leave the planner usable in-memory and state the recovery action.

## Motion

- 180ms transitions for opacity, transform, and background changes; new nodes enter from 6px below, consistent with placing a ticket on a bench.
- The progress notch moves along its rail over 240ms. Nothing loops or autoplays.
- Under `prefers-reduced-motion: reduce`, all motion and smooth scrolling become instant; state remains legible through copy, shape, and contrast.

## Asset plan and provenance

### `study-strata`

- Purpose: a wide hero illustration showing a finite route through foundation blocks into a living target lane; reinforces bounded prerequisites without pretending to be a universal curriculum.
- Use case: stylized-concept.
- Art direction prompt: “Wide editorial still life viewed at a shallow three-quarter angle: a compact brutalist concrete study workbench made of five finite stepping slabs, thin vivid moss growing through selected seams and continuing directly into one open bright path, tactile aggregate, graphite registration marks without readable lettering, pale mineral backdrop, hard overcast daylight, restrained palette of chalk concrete, charcoal, deep forest moss, and lichen yellow, quiet determined mood, generous negative space, no people, no text, no numbers, no logos, no watermark, no UI screenshot, no fantasy ruins, no gradients.”
- Model: Azure OpenAI image generation, deployment `factory-image` via `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-27.
- License/provenance: original generated asset commissioned for this product; no reference images or third-party marks.
- Outputs: source PNG retained in `assets/src/`; responsive WebP derivatives in `public/assets/`, each under 300 KB.

Hand-authored SVG symbols are limited to interface arrows/checks and are embedded in the app markup; they are original and use `currentColor`.
