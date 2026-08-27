import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
const results = await new AxeBuilder({ page }).analyze();
const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
console.log(JSON.stringify({ url, violations: results.violations.length, serious }, null, 2));
await browser.close();
if (serious.length) process.exit(1);
