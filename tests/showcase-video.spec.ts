import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'showcase');

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function settle(page: Parameters<typeof test>[0]['page'], ms = 1400) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

async function selectSource(page: Parameters<typeof test>[0]['page'], value: string) {
  const select = page.locator('select').first();
  await expect(select).toBeVisible();
  await select.selectOption(value);
  await settle(page, 1200);
}

async function resetDemo(page: Parameters<typeof test>[0]['page']) {
  const button = page.getByRole('button', { name: 'Reset demo' });
  if (await button.isVisible()) {
    await button.click();
    await settle(page, 1500);
  }
}

test.beforeEach(async ({ page }) => {
  await ensureOutputDir();
  await page.goto('/');
  await page.waitForSelector('text=Record source');
  await settle(page, 1800);
});

test('website-style app showcase capture', async ({ page }) => {
  await resetDemo(page);
  await selectSource(page, 'runtime:reporting-access');
  await page.mouse.wheel(0, 250);
  await settle(page, 1200);
  await page.mouse.wheel(0, 450);
  await settle(page, 1200);
  await page.mouse.wheel(0, 500);
  await settle(page, 1200);
  await page.mouse.wheel(0, -500);
  await settle(page, 1000);
  await page.getByRole('button', { name: 'Approve' }).click();
  await settle(page, 600);
  await page.locator('section').filter({ hasText: 'Approval and control' }).getByRole('button', { name: 'Confirm', exact: true }).click();
  await settle(page, 7500);
  await page.mouse.wheel(0, 900);
  await settle(page, 1500);
});

test('vpn execution showcase capture', async ({ page }) => {
  await selectSource(page, 'runtime:vpn-policy-change');
  await settle(page, 1200);
  await page.mouse.wheel(0, 300);
  await settle(page, 1000);
  await page.mouse.wheel(0, 500);
  await settle(page, 1200);
  await page.mouse.wheel(0, 500);
  await settle(page, 1200);
  await page.mouse.wheel(0, -250);
  await settle(page, 1000);
});
