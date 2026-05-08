import { chromium } from 'playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(root, 'index.html');
const browser = await chromium.launch();

try {
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

  await page.locator('#atarSearch').fill('Mathematics Extension 2');
  await page.locator('#atarDropdown .dd-item').first().click();
  await page.locator('#atarSubjectsList').getByText('Mathematics Extension 2').waitFor();
  await page.locator('#atarSearch').fill('Mathematics Extension 1');
  await page.locator('#atarDropdown .dd-item').first().click();
  await page.locator('#atarSubjectsList').getByText('Mathematics Extension 1').waitFor();
  const mathUnits = await page.evaluate(() => ({
    advanced: getSubjectUnits('Mathematics Advanced'),
    ext1: getSubjectUnits('Mathematics Extension 1'),
    ext2: getSubjectUnits('Mathematics Extension 2')
  }));
  if(mathUnits.advanced !== 0 || mathUnits.ext1 !== 2 || mathUnits.ext2 !== 2){
    throw new Error(`Expected Advanced/Ext1/Ext2 maths units to be 0/2/2, got ${mathUnits.advanced}/${mathUnits.ext1}/${mathUnits.ext2}`);
  }

  await page.evaluate(() => {
    localStorage.setItem('knox26_subjects', JSON.stringify([
      {sName:'Ancient History',rank:'',cohort:''},
      {sName:'Biology',rank:'',cohort:''},
      {sName:'Business Studies',rank:'',cohort:''},
      {sName:'Chemistry',rank:'',cohort:''},
      {sName:'Economics',rank:'',cohort:''},
      {sName:'English Advanced',rank:'',cohort:''},
      {sName:'Geography',rank:'',cohort:''}
    ]));
    localStorage.setItem('knox26_atar', JSON.stringify([
      {sName:'Ancient History',kam:'80',goalKam:''},
      {sName:'Biology',kam:'81',goalKam:''},
      {sName:'Business Studies',kam:'82',goalKam:''},
      {sName:'Chemistry',kam:'83',goalKam:''},
      {sName:'Economics',kam:'84',goalKam:''},
      {sName:'English Advanced',kam:'85',goalKam:''},
      {sName:'Geography',kam:'86',goalKam:''},
      {sName:'Legal Studies',kam:'99',goalKam:'98'}
    ]));
  });
  await page.reload();
  await page.getByRole('button', { name: 'ATAR' }).click();
  await page.locator('#atarSubjectsList').getByText('Legal Studies').waitFor();
  const preservedLegal = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('knox26_atar'));
    return saved.find(s => s.sName === 'Legal Studies');
  });
  if(preservedLegal?.kam !== '99' || preservedLegal?.goalKam !== '98'){
    throw new Error('Expected overflow ATAR subject and KAM values to be preserved');
  }
  await page.waitForTimeout(500);

  await page.screenshot({ path: resolve(root, 'screenshots/desktop-atar.png'), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`file://${indexPath}`);
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: resolve(root, 'screenshots/mobile-home.png'), fullPage: true });
} finally {
  await browser.close();
}
