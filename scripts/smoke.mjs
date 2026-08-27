import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto(url, { waitUntil: 'networkidle' });
const requiredTouchTargets = [
  ['wordmark/home link', '.wordmark'],
  ['Import JSON button', '[data-action="import"]'],
  ['Export JSON button', '[data-action="export"]'],
  ['Clear map button', '[data-action="reset"]'],
  ['Terms footer link', 'footer a[href="/terms"]'],
];
for (const [name, selector] of requiredTouchTargets) {
  const box = await page.locator(selector).boundingBox();
  if (!box || box.width < 44 || box.height < 44) {
    const measured = box ? `${box.width.toFixed(2)}×${box.height.toFixed(2)}px` : 'not visible';
    throw new Error(`${name} does not meet the 44×44px mobile touch-target minimum (${measured}).`);
  }
}
await page.selectOption('#template', 'data-structures');
await page.click('[data-action="load-template"]');
if (await page.locator('.prereq-lane .node').count() !== 4) throw new Error('Template prerequisites did not load.');
if (await page.locator('.target-lane .node').count() !== 1) throw new Error('Template target exercise did not load.');
for (const [name, selector] of [
  ['prerequisite estimate', '.prereq-lane .node .minutes-input'],
  ['target estimate', '.target-lane .node .minutes-input'],
]) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box || box.width < 44 || box.height < 44) {
    const measured = box ? `${box.width.toFixed(2)}×${box.height.toFixed(2)}px` : 'not visible';
    throw new Error(`${name} does not meet the 44×44px mobile touch-target minimum (${measured}).`);
  }
}
await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
let importReachedByTab = false;
for (let step = 0; step < 32; step += 1) {
  await page.keyboard.press('Tab');
  importReachedByTab = await page.locator('[data-action="import"]').evaluate((element) => document.activeElement === element);
  if (importReachedByTab) break;
}
if (!importReachedByTab) throw new Error('Import JSON is not reachable through the keyboard Tab sequence.');
const importFocus = await page.locator('[data-action="import"]').evaluate((element) => {
  const style = getComputedStyle(element);
  return {
    active: document.activeElement === element,
    visible: element.matches(':focus-visible'),
    outlineWidth: style.outlineWidth,
    outlineStyle: style.outlineStyle,
    box: element.getBoundingClientRect().toJSON(),
  };
});
if (!importFocus.active || !importFocus.visible || importFocus.outlineStyle === 'none' || Number.parseFloat(importFocus.outlineWidth) < 3 || importFocus.box.width < 44 || importFocus.box.height < 44) {
  throw new Error(`Import JSON does not expose its required visible keyboard focus state (${JSON.stringify(importFocus)}).`);
}
const hiddenImportTabIndex = await page.locator('#import-file').getAttribute('tabindex');
if (hiddenImportTabIndex !== '-1') throw new Error('The hidden native Import JSON input must not create a Tab stop.');
const fileChooser = page.waitForEvent('filechooser');
await page.keyboard.press('Enter');
await (await fileChooser).setFiles([]);
await page.keyboard.press('Tab');
if (!(await page.locator('[data-action="export"]').evaluate((element) => document.activeElement === element))) {
  throw new Error('Tab from Import JSON did not move to Export JSON; the native file input may still be in the keyboard order.');
}
await page.check('.prereq-lane [data-node-field="known"]');
await page.check('.target-lane [data-exercise-field="done"]');
if (!(await page.locator('.checkpoint').getAttribute('class')).includes('achieved')) throw new Error('Checkpoint did not update.');
await page.fill('#new-exercise', 'Compare two traversal orders');
await page.press('#new-exercise', 'Enter');
if (await page.locator('.target-lane .node').count() !== 2) throw new Error('Keyboard add failed.');
await page.fill('#new-exercise', 'Bounded target estimate');
await page.fill('#new-exercise-minutes', '10001');
await page.click('[data-action="add-exercise"]');
if (await page.locator('.target-lane [data-exercise-field="minutes"]').last().inputValue() !== '10000') {
  throw new Error('New exercise estimate exceeded the 10,000-minute maximum.');
}
await page.fill('#new-prereq', 'Bounded prerequisite estimate');
await page.fill('#new-prereq-minutes', '10001');
await page.click('[data-action="add-prereq"]');
if (await page.locator('.prereq-lane [data-node-field="minutes"]').last().inputValue() !== '10000') {
  throw new Error('New prerequisite estimate exceeded the 10,000-minute maximum.');
}
const savedBeforeInvalidImport = await page.evaluate(() => localStorage.getItem('prereq-sprint-map:v1'));
await page.setInputFiles('#import-file', {
  name: 'invalid-target-date.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({
    version: 1,
    target: 'Invalid import',
    targetDate: '2026-02-30',
    hoursPerWeek: 5,
    sessionMinutes: 30,
    assumption: '',
    prerequisites: [],
    exercises: [],
  })),
});
await page.waitForFunction(() => document.querySelector('.status-live')?.textContent?.includes('invalid target date'));
if ((await page.locator('.status-live').textContent())?.includes('Map imported and saved')) {
  throw new Error('Invalid date import announced success.');
}
if (await page.evaluate(() => localStorage.getItem('prereq-sprint-map:v1')) !== savedBeforeInvalidImport) {
  throw new Error('Invalid date import was persisted.');
}
await page.reload({ waitUntil: 'networkidle' });
if (await page.locator('.target-lane .node').count() !== 3) throw new Error('Local persistence failed.');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: 'networkidle' });
await page.context().setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
const offlineMain = await page.locator('#main').count();
if (offlineMain !== 1) throw new Error(`Offline shell failed (main: ${offlineMain}).`);
await page.context().setOffline(false);
await page.goto(new URL('/privacy', url).href, { waitUntil: 'networkidle' });
if (await page.locator('h1').count() !== 1) throw new Error('Privacy route has invalid h1 count.');
await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
console.log('Browser smoke: 390px touch targets and visible Import JSON keyboard focus, template, diagnostics, bounded estimates, invalid-date import recovery, persistence, offline shell, and legal route passed.');
