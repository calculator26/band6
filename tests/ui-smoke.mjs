import { chromium } from 'playwright';
import { resolve } from 'node:path';

const root = resolve('.');
const indexPath = resolve(root, 'index.html');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 980 } });

await page.goto(`file://${indexPath}`);
await page.evaluate(() => localStorage.clear());
await page.reload();

await page.getByRole('button', { name: 'ATAR' }).click();
await page.locator('#atarSearch').fill('Legal Studies');
await page.locator('#atarDropdown .dd-item').first().click();
await page.locator('#atarSubjectsList').getByText('Legal Studies').waitFor();

await page.getByRole('button', { name: 'Band 6' }).click();
await page.locator('#subjectsList').getByText('Legal Studies').waitFor();

await page.getByRole('button', { name: 'ATAR' }).click();
await page.locator('#atarSubjectsList .rm-btn').first().click();
await page.getByRole('button', { name: 'Band 6' }).click();
await page.locator('#subjectsList').getByText('Search above to add your subjects').waitFor();

await page.locator('#subjectSearch').fill('Mathematics Advanced');
await page.locator('#dropdown .dd-item').first().click();
await page.getByRole('button', { name: 'ATAR' }).click();
await page.locator('#atarSubjectsList').getByText('Mathematics Advanced').waitFor();
await page.waitForTimeout(500);

await page.screenshot({ path: 'screenshots/desktop-atar.png', fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await mobile.goto(`file://${indexPath}`);
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: 'screenshots/mobile-home.png', fullPage: true });

await browser.close();
