import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'screenshots', 'first-pass');

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function settle(page: Parameters<typeof test>[0]['page']) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1800);
}

async function selectSource(page: Parameters<typeof test>[0]['page'], value: string) {
  const select = page.locator('select').first();
  await expect(select).toBeVisible();
  await select.selectOption(value);
  await settle(page);
}

test.beforeEach(async ({ page }) => {
  await ensureOutputDir();
  await page.goto('/');
  await page.waitForSelector('text=Record source');
  await settle(page);
});

test('capture first-pass TrustPlane screenshots', async ({ page }) => {
  await selectSource(page, 'runtime:reporting-access');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-reporting-access-full.png'), fullPage: true });

  await page.locator('text=Workflow rail').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02-reporting-access-workflow.png'), fullPage: false });

  await selectSource(page, 'runtime:vpn-policy-change');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-vpn-policy-full.png'), fullPage: true });

  await page.locator('text=Action timeline').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-vpn-policy-timeline.png'), fullPage: false });

  await selectSource(page, 'example:example-01-reporting-dashboard-access');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-example-reporting-full.png'), fullPage: true });
});
