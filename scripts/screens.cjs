// Hilfsskript: Screenshots ausgewählter Seiten (node scripts/screens.cjs <baseUrl> <outDir> [pfad...])
const { chromium } = require('playwright');
(async () => {
  const [base, out, ...paths] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  for (const p of paths) {
    await page.goto(base + '#' + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const name = p.replace(/[^a-z0-9]+/gi, '_') || 'home';
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: process.env.FULL === '1' });
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors');
  await browser.close();
})();
