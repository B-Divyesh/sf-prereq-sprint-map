import './styles.css';
import { calculateCapacity, clampEstimateMinutes, completion, emptyPlan, validatePlan, type Plan, type Prerequisite } from './model';
import { templates } from './templates';

const STORAGE_KEY = 'prereq-sprint-map:v1';
const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing.');
const app: HTMLDivElement = root;

let plan = emptyPlan();
let storageWarning = '';
let message = '';
let removed: { item: Prerequisite | Plan['exercises'][number]; lane: 'prerequisites' | 'exercises'; index: number } | null = null;
let undoTimer = 0;

function load(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) plan = validatePlan(JSON.parse(saved));
  } catch {
    storageWarning = 'Saved work could not be opened. A fresh map is ready; export it before closing this tab.';
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    storageWarning = '';
  } catch {
    storageWarning = 'This browser blocked local saving. Keep this tab open or export your map.';
  }
}

function update(nextMessage = ''): void {
  save();
  message = nextMessage;
  render();
}

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}

function pageShell(content: string, legal = false): string {
  return `
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="Prerequisite Sprint Map home"><span aria-hidden="true">PSM/</span> Prerequisite Sprint Map</a>
      <nav aria-label="Primary"><a href="/${legal ? '' : '#how'}">${legal ? 'Planner' : 'How it works'}</a><a href="/privacy">Privacy</a></nav>
    </header>
    ${content}
    <footer><p>Built to get you into the real material sooner. Your map stays on this device.</p><nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav><p class="asset-note">Hero image generated for this product with Azure OpenAI. No stock assets.</p></footer>`;
}

function renderLegal(kind: 'privacy' | 'terms'): void {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Prerequisite Sprint Map`;
  app.innerHTML = pageShell(`<main id="main" class="legal-page">
    <p class="eyebrow">PLAIN-LANGUAGE ${privacy ? 'PRIVACY' : 'TERMS'} / 27 AUG 2026</p>
    <h1>${privacy ? 'Your study map is yours.' : 'Use it as a planning aid.'}</h1>
    ${privacy ? `
      <p class="lede">Prerequisite Sprint Map has no accounts, analytics, ads, tracking pixels, or remote database.</p>
      <h2>What is stored</h2><p>Your target, dates, capacity, checks, and notes are stored only in your browser using local storage. Exported JSON files go wherever you choose to save them.</p>
      <h2>What leaves your device</h2><p>Nothing you enter is transmitted to us. The hosting provider may process standard network logs such as an IP address to deliver and secure the site.</p>
      <h2>Your control</h2><p>Use “Clear map” in the planner or clear this site's browser storage. Uninstalling the PWA also removes its cached app shell, though browser storage policies vary.</p>
      <h2>Young learners</h2><p>We do not collect educational records or profile learners. If you share an exported map, remove personal details first.</p>` : `
      <p class="lede">This free tool helps you form a bounded learning plan. It does not certify that a path is complete or universally correct.</p>
      <h2>No universal curriculum</h2><p>Templates state their assumptions and are editable starting points. Check course, workplace, or instructor requirements when those govern your target.</p>
      <h2>Your responsibility</h2><p>You choose what to study and what to share. Do not place sensitive personal information in a map you intend to export.</p>
      <h2>Availability</h2><p>The software is provided “as is,” without warranties. We may improve or discontinue the hosted version; exporting gives you a portable copy of your map.</p>
      <h2>License</h2><p>The application source is available under the MIT License.</p>`}
    <p><a class="button-link" href="/">Return to your map</a></p>
  </main>`, true);
}

function render(): void {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/privacy' || path === '/terms') {
    renderLegal(path.slice(1) as 'privacy' | 'terms');
    return;
  }
  document.title = 'Prerequisite Sprint Map — start the real topic now';
  const capacity = calculateCapacity(plan);
  const progress = completion(plan);
  const optionalOpen = plan.prerequisites.filter((item) => !item.required && !item.known && !item.done).length;
  const requiredOpen = plan.prerequisites.filter((item) => item.required && !item.known && !item.done).length;
  const targetOpen = plan.exercises.filter((item) => !item.done).length;
  const ready = Boolean(plan.target.trim() && plan.exercises.length);

  app.innerHTML = pageShell(`
    <div id="offline" class="offline ${navigator.onLine ? 'is-hidden' : ''}" role="status">Offline — the saved planner still works.</div>
    <main id="main">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="eyebrow">BOUND THE FOUNDATION / START THE SUBJECT</p>
          <h1 id="page-title">Stop preparing.<br><span>Start the thing.</span></h1>
          <p class="lede">Make a small prerequisite contract, fit it to your available time, and put one real target exercise on the map now.</p>
          <a class="button-link primary" href="#workbench">Build my sprint <span aria-hidden="true">↓</span></a>
        </div>
        <figure class="hero-art">
          <picture>
            <source media="(max-width: 700px)" srcset="/assets/study-strata-720.webp" />
            <img src="/assets/study-strata-1280.webp" width="1280" height="853" fetchpriority="high" decoding="async" alt="Finite concrete study slabs crossed by a continuous path of living moss." />
          </picture>
          <figcaption>Build only enough foundation to cross into the subject.</figcaption>
        </figure>
      </section>

      <section class="workbench" id="workbench" aria-labelledby="planner-title">
        <div class="section-heading">
          <div><p class="eyebrow">YOUR WORKBENCH</p><h2 id="planner-title">The sprint contract</h2></div>
          <div class="file-actions">
            <label class="button compact" for="import-file">Import JSON</label>
            <input class="visually-hidden" id="import-file" type="file" accept="application/json,.json" />
            <button class="button compact" data-action="export">Export JSON</button>
            <button class="text-button danger" data-action="reset">Clear map</button>
          </div>
        </div>
        ${storageWarning ? `<p class="notice error" role="alert">${esc(storageWarning)}</p>` : ''}
        <div class="status-live" aria-live="polite">${esc(message)}</div>

        <section class="setup" aria-labelledby="setup-title">
          <div class="setup-marker" aria-hidden="true">01</div>
          <div class="setup-body">
            <h3 id="setup-title">Name the finish line</h3>
            <div class="form-grid">
              <label class="field field-wide">Target topic
                <input id="target" data-field="target" value="${esc(plan.target)}" placeholder="e.g. Build a binary search tree" />
              </label>
              <label class="field">Target date
                <input type="date" id="target-date" data-field="targetDate" value="${esc(plan.targetDate)}" min="${today()}" />
              </label>
              <label class="field">Hours per week
                <input type="number" data-field="hoursPerWeek" min="0.5" max="80" step="0.5" value="${plan.hoursPerWeek}" />
              </label>
              <label class="field">Session size
                <span class="input-unit"><input type="number" data-field="sessionMinutes" min="10" max="240" step="5" value="${plan.sessionMinutes}" /><span>min</span></span>
              </label>
              <label class="field field-wide">Assumptions and boundaries
                <textarea data-field="assumption" rows="2" placeholder="What does this map assume? What is intentionally outside this sprint?">${esc(plan.assumption)}</textarea>
              </label>
            </div>
            <div class="template-row">
              <label for="template">Start from an editable example</label>
              <select id="template"><option value="">Choose a subject…</option>${templates.map((template) => `<option value="${template.id}">${esc(template.label)}</option>`).join('')}</select>
              <button class="button" data-action="load-template">Load example</button>
            </div>
            <p class="caveat">Examples are starting hypotheses, not universal requirements. Edit or remove anything that does not match your course and context.</p>
          </div>
        </section>

        <section class="capacity ${capacity.marginMinutes < 0 ? 'over' : ''}" aria-labelledby="capacity-title">
          <div class="setup-marker" aria-hidden="true">02</div>
          <div class="capacity-body">
            <div class="capacity-top"><div><h3 id="capacity-title">Capacity check</h3><p>${capacity.isPast ? 'Choose today or a future date.' : `${capacity.days} day${capacity.days === 1 ? '' : 's'} · ${formatMinutes(capacity.availableMinutes)} available`}</p></div><strong>${capacity.totalMinutes ? `${capacity.percent}% covered` : 'No work estimated'}</strong></div>
            <div class="meter" role="meter" aria-label="Capacity covered" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${capacity.percent}"><span style="width:${capacity.percent}%"></span></div>
            <div class="capacity-grid">
              <p><span>Prerequisites left</span><strong>${formatMinutes(capacity.prerequisiteMinutes)}</strong></p>
              <p><span>Target work left</span><strong>${formatMinutes(capacity.targetMinutes)}</strong></p>
              <p><span>${capacity.marginMinutes >= 0 ? 'Room remaining' : 'Over capacity'}</span><strong>${formatMinutes(Math.abs(capacity.marginMinutes))}</strong></p>
              <p><span>Sessions available</span><strong>${Math.floor(capacity.availableMinutes / plan.sessionMinutes)}</strong></p>
            </div>
            ${capacity.marginMinutes < 0 ? `<p class="notice warning"><strong>The map does not fit yet.</strong> Remove optional work, shorten estimates, add weekly time, or move the date by about ${Math.ceil(Math.abs(capacity.marginMinutes) / (plan.hoursPerWeek * 60) * 7)} days.</p>` : ''}
          </div>
        </section>

        <section class="map-section" aria-labelledby="map-title">
          <div class="map-intro"><div><p class="eyebrow">03 / WORK BOTH LANES</p><h3 id="map-title">The smallest route in</h3></div><p>Diagnose first. Checking “I can do this” removes that estimate from the sprint without deleting the evidence.</p></div>
          <div class="lanes">
            <section class="lane target-lane" aria-labelledby="target-lane-title">
              <header><span class="lane-tag">START NOW</span><h4 id="target-lane-title">Target material</h4><p>Do one imperfect, real exercise before every optional foundation is complete.</p></header>
              <ol class="node-list">${plan.exercises.length ? plan.exercises.map((item, index) => exerciseNode(item, index)).join('') : emptyState('No target exercise yet.', 'Add the smallest exercise that genuinely touches your topic.')}</ol>
              <div class="add-row">
                <label class="visually-hidden" for="new-exercise">New target exercise</label><input id="new-exercise" placeholder="e.g. Solve one real problem" />
                <label class="visually-hidden" for="new-exercise-minutes">Minutes</label><input class="minutes-input" id="new-exercise-minutes" type="number" min="5" max="10000" step="5" value="30" />
                <button class="button primary" data-action="add-exercise">Add exercise</button>
              </div>
            </section>
            <section class="lane prereq-lane" aria-labelledby="prereq-lane-title">
              <header><span class="lane-tag">BOUND IT</span><h4 id="prereq-lane-title">Prerequisites</h4><p>Required means a current blocker. Optional means helpful, but not a gate.</p></header>
              <ol class="node-list">${plan.prerequisites.length ? plan.prerequisites.map((item, index) => prerequisiteNode(item, index)).join('') : emptyState('No prerequisites listed.', 'That may be valid. Add only a skill that currently blocks the target exercise.')}</ol>
              <div class="add-row">
                <label class="visually-hidden" for="new-prereq">New prerequisite</label><input id="new-prereq" placeholder="e.g. Read array indexes" />
                <label class="visually-hidden" for="new-prereq-minutes">Minutes</label><input class="minutes-input" id="new-prereq-minutes" type="number" min="5" max="10000" step="5" value="30" />
                <button class="button primary" data-action="add-prereq">Add prerequisite</button>
              </div>
            </section>
          </div>
        </section>

        <section class="checkpoint ${progress.targetStarted ? 'achieved' : ''}" aria-labelledby="checkpoint-title">
          <div class="checkpoint-mark" aria-hidden="true">${progress.targetStarted ? '✓' : '→'}</div>
          <div><p class="eyebrow">START-NOW CHECKPOINT</p><h3 id="checkpoint-title">${progress.targetStarted ? 'You entered the subject.' : ready ? 'Your next move is in the target lane.' : 'Add one target exercise.'}</h3>
          <p>${progress.targetStarted ? `A target exercise is complete with ${optionalOpen} optional prerequisite${optionalOpen === 1 ? '' : 's'} still open. That is the anti-paralysis win.` : ready ? `Complete a target exercise while you work the ${requiredOpen} required blocker${requiredOpen === 1 ? '' : 's'} in parallel.` : 'Make the exercise small enough to attempt now, even if you expect to struggle.'}</p></div>
          <div class="checkpoint-count"><strong>${progress.completed}/${progress.total}</strong><span>items cleared</span><small>${targetOpen} target open</small></div>
        </section>
      </section>

      <section class="how" id="how" aria-labelledby="how-title">
        <p class="eyebrow">THE RULES OF THE SLAB</p><h2 id="how-title">Enough foundation. No moat.</h2>
        <ol><li><strong>Diagnose, don’t collect.</strong><span>Mark what you can already do. Name only current blockers.</span></li><li><strong>Make time visible.</strong><span>If the contract does not fit, cut optional scope before adding hours.</span></li><li><strong>Cross early.</strong><span>Attempt real target work now; let friction reveal the next prerequisite.</span></li></ol>
      </section>
    </main>`);
}

function prerequisiteNode(item: Prerequisite, index: number): string {
  const cleared = item.known || item.done;
  return `<li class="node ${cleared ? 'cleared' : ''}" data-id="${esc(item.id)}">
    <div class="node-top"><span class="node-index">P${String(index + 1).padStart(2, '0')}</span><span class="node-kind ${item.required ? 'required' : ''}">${item.required ? 'Required' : 'Optional'}</span><div class="node-controls"><button class="icon-button" data-action="move-up" aria-label="Move ${esc(item.title)} up" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" data-action="move-down" aria-label="Move ${esc(item.title)} down" ${index === plan.prerequisites.length - 1 ? 'disabled' : ''}>↓</button><button class="icon-button danger" data-action="remove-prereq" aria-label="Remove ${esc(item.title)}">×</button></div></div>
    <label class="field">Skill or concept<input data-node-field="title" value="${esc(item.title)}" /></label>
    <div class="node-meta"><label class="check"><input type="checkbox" data-node-field="known" ${item.known ? 'checked' : ''} /><span>I can do this</span></label><label class="check"><input type="checkbox" data-node-field="done" ${item.done ? 'checked' : ''} /><span>Practiced</span></label></div>
    <div class="node-foot"><label><span class="visually-hidden">Estimated minutes for ${esc(item.title)}</span><input class="minutes-input" type="number" data-node-field="minutes" min="5" max="10000" step="5" value="${item.minutes}" /> min</label><label class="toggle-kind"><input type="checkbox" data-node-field="required" ${item.required ? 'checked' : ''} /><span>Required blocker</span></label></div>
  </li>`;
}

function exerciseNode(item: Plan['exercises'][number], index: number): string {
  return `<li class="node exercise ${item.done ? 'cleared' : ''}" data-id="${esc(item.id)}">
    <div class="node-top"><span class="node-index">T${String(index + 1).padStart(2, '0')}</span><span class="node-kind target">Real material</span><button class="icon-button danger" data-action="remove-exercise" aria-label="Remove ${esc(item.title)}">×</button></div>
    <label class="field">Exercise<input data-exercise-field="title" value="${esc(item.title)}" /></label>
    <div class="node-foot"><label class="check"><input type="checkbox" data-exercise-field="done" ${item.done ? 'checked' : ''} /><span>Completed</span></label><label><span class="visually-hidden">Estimated minutes for ${esc(item.title)}</span><input class="minutes-input" type="number" data-exercise-field="minutes" min="5" max="10000" step="5" value="${item.minutes}" /> min</label></div>
  </li>`;
}

function emptyState(title: string, detail: string): string {
  return `<li class="empty"><span aria-hidden="true">＋</span><strong>${title}</strong><p>${detail}</p></li>`;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function today(): string {
  const current = new Date();
  const offset = current.getTimezoneOffset();
  return new Date(current.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function id(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function numericValue(element: HTMLInputElement, fallback: number): number {
  const parsed = Number(element.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function findNode(target: HTMLElement): { element: HTMLElement; index: number } | null {
  const element = target.closest<HTMLElement>('[data-id]');
  if (!element) return null;
  const index = plan.prerequisites.findIndex((item) => item.id === element.dataset.id);
  return index < 0 ? null : { element, index };
}

function findExercise(target: HTMLElement): number {
  const element = target.closest<HTMLElement>('[data-id]');
  return plan.exercises.findIndex((item) => item.id === element?.dataset.id);
}

app.addEventListener('change', async (event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  if (target.id === 'import-file' && target instanceof HTMLInputElement) {
    const file = target.files?.[0];
    if (!file) return;
    try {
      plan = validatePlan(JSON.parse(await file.text()));
      update('Map imported and saved on this device.');
    } catch (error) {
      message = error instanceof Error ? `${error.message} Choose a JSON file exported by this planner.` : 'Import failed.';
      render();
    }
    return;
  }
  const field = target.dataset.field as keyof Plan | undefined;
  if (field) {
    if (field === 'hoursPerWeek') plan.hoursPerWeek = Math.min(80, Math.max(0.5, numericValue(target as HTMLInputElement, 5)));
    else if (field === 'sessionMinutes') plan.sessionMinutes = Math.min(240, Math.max(10, numericValue(target as HTMLInputElement, 30)));
    else if (field === 'target' || field === 'targetDate' || field === 'assumption') plan[field] = target.value;
    update();
    return;
  }
  const nodeField = target.dataset.nodeField as keyof Prerequisite | undefined;
  if (nodeField) {
    const found = findNode(target);
    if (!found) return;
    const node = plan.prerequisites[found.index];
    if (nodeField === 'minutes') node.minutes = clampEstimateMinutes(numericValue(target as HTMLInputElement, 30));
    else if (nodeField === 'known' || nodeField === 'done' || nodeField === 'required') node[nodeField] = (target as HTMLInputElement).checked;
    else if (nodeField === 'title') node.title = target.value;
    update(nodeField === 'known' && node.known ? 'Diagnostic updated. This estimate is no longer counted.' : '');
    return;
  }
  const exerciseField = target.dataset.exerciseField as keyof Plan['exercises'][number] | undefined;
  if (exerciseField) {
    const index = findExercise(target);
    if (index < 0) return;
    const exercise = plan.exercises[index];
    if (exerciseField === 'minutes') exercise.minutes = clampEstimateMinutes(numericValue(target as HTMLInputElement, 30));
    else if (exerciseField === 'done') exercise.done = (target as HTMLInputElement).checked;
    else if (exerciseField === 'title') exercise.title = target.value;
    update(exerciseField === 'done' && exercise.done ? 'Target exercise completed. You crossed into the subject.' : '');
  }
});

app.addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'add-prereq') addPrerequisite();
  if (action === 'add-exercise') addExercise();
  if (action === 'load-template') loadTemplate();
  if (action === 'export') exportPlan();
  if (action === 'reset') resetPlan();
  if (action === 'undo') restoreRemoved();
  if (action === 'remove-prereq') removeItem(button, 'prerequisites');
  if (action === 'remove-exercise') removeItem(button, 'exercises');
  if (action === 'move-up' || action === 'move-down') movePrerequisite(button, action === 'move-up' ? -1 : 1);
});

app.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.shiftKey) return;
  const target = event.target as HTMLElement;
  if (target.id === 'new-prereq') addPrerequisite();
  if (target.id === 'new-exercise') addExercise();
});

function addPrerequisite(): void {
  const title = document.querySelector<HTMLInputElement>('#new-prereq')?.value.trim();
  const minutes = numericValue(document.querySelector<HTMLInputElement>('#new-prereq-minutes')!, 30);
  if (!title) {
    message = 'Name the prerequisite before adding it.';
    render();
    document.querySelector<HTMLInputElement>('#new-prereq')?.focus();
    return;
  }
  plan.prerequisites.push({ id: id(), title, minutes: clampEstimateMinutes(minutes), required: true, known: false, done: false });
  update(`${title} added as a required blocker. Change it to optional if it is only helpful.`);
  document.querySelector<HTMLInputElement>('#new-prereq')?.focus();
}

function addExercise(): void {
  const title = document.querySelector<HTMLInputElement>('#new-exercise')?.value.trim();
  const minutes = numericValue(document.querySelector<HTMLInputElement>('#new-exercise-minutes')!, 30);
  if (!title) {
    message = 'Name the target exercise before adding it.';
    render();
    document.querySelector<HTMLInputElement>('#new-exercise')?.focus();
    return;
  }
  plan.exercises.push({ id: id(), title, minutes: clampEstimateMinutes(minutes), done: false });
  update(`${title} added to the start-now lane.`);
  document.querySelector<HTMLInputElement>('#new-exercise')?.focus();
}

function removeItem(button: HTMLButtonElement, lane: 'prerequisites' | 'exercises'): void {
  const element = button.closest<HTMLElement>('[data-id]');
  if (!element) return;
  const list = plan[lane];
  const index = list.findIndex((item) => item.id === element.dataset.id);
  if (index < 0) return;
  removed = { item: list[index], lane, index };
  list.splice(index, 1);
  window.clearTimeout(undoTimer);
  undoTimer = window.setTimeout(() => { removed = null; }, 10_000);
  update(`${removed.item.title} removed. `);
  const live = document.querySelector('.status-live');
  if (live) live.innerHTML = `${esc(message)}<button class="text-button" data-action="undo">Undo</button>`;
}

function restoreRemoved(): void {
  if (!removed) return;
  if (removed.lane === 'prerequisites') plan.prerequisites.splice(removed.index, 0, removed.item as Prerequisite);
  else plan.exercises.splice(removed.index, 0, removed.item as Plan['exercises'][number]);
  const title = removed.item.title;
  removed = null;
  window.clearTimeout(undoTimer);
  update(`${title} restored.`);
}

function movePrerequisite(button: HTMLButtonElement, direction: number): void {
  const found = findNode(button);
  if (!found) return;
  const next = found.index + direction;
  if (next < 0 || next >= plan.prerequisites.length) return;
  const [item] = plan.prerequisites.splice(found.index, 1);
  plan.prerequisites.splice(next, 0, item);
  update(`${item.title} moved ${direction < 0 ? 'up' : 'down'}.`);
  document.querySelector<HTMLButtonElement>(`[data-id="${CSS.escape(item.id)}"] [data-action="move-${direction < 0 ? 'up' : 'down'}"]`)?.focus();
}

function loadTemplate(): void {
  const selected = document.querySelector<HTMLSelectElement>('#template')?.value;
  const template = templates.find((item) => item.id === selected);
  if (!template) {
    message = 'Choose an example first.';
    render();
    document.querySelector<HTMLSelectElement>('#template')?.focus();
    return;
  }
  const hasWork = plan.target || plan.prerequisites.length || plan.exercises.length;
  if (hasWork && !window.confirm(`Replace this map with the ${template.label} example? Export first if you want a copy.`)) return;
  plan = structuredClone(template.plan);
  update(`${template.label} example loaded. Check its assumption before using it.`);
}

function exportPlan(): void {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${plan.target.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sprint-map'}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  message = 'Portable JSON exported.';
  render();
}

function resetPlan(): void {
  if (!window.confirm('Clear this entire sprint map from this device? Export first if you want a copy.')) return;
  plan = emptyPlan();
  localStorage.removeItem(STORAGE_KEY);
  message = 'Map cleared. Start with one target exercise.';
  render();
}

function onConnectionChange(): void {
  document.querySelector('#offline')?.classList.toggle('is-hidden', navigator.onLine);
}

window.addEventListener('online', onConnectionChange);
window.addEventListener('offline', onConnectionChange);
window.addEventListener('popstate', render);
document.addEventListener('click', (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="/"]');
  if (!link || link.target || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || (url.pathname === '/' && url.hash)) return;
  event.preventDefault();
  history.pushState({}, '', url.pathname);
  render();
  window.scrollTo(0, 0);
});

load();
render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
