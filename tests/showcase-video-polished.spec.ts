import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'showcase', 'polished');

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function settle(page: Parameters<typeof test>[0]['page'], ms = 1600) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

async function waitForCompletion(page: Parameters<typeof test>[0]['page'], timeout = 15000) {
  await expect(page.locator('text=Completed and verified').first()).toBeVisible({ timeout });
}

async function selectSource(page: Parameters<typeof test>[0]['page'], value: string) {
  const select = page.locator('select').first();
  await expect(select).toBeVisible();
  await select.selectOption(value);
  await settle(page, 1400);
}

async function resetDemo(page: Parameters<typeof test>[0]['page']) {
  const button = page.getByRole('button', { name: 'Reset demo' });
  if (await button.isVisible()) {
    await button.click();
    await settle(page, 1800);
  }
}

async function smoothScroll(page: Parameters<typeof test>[0]['page'], distance: number, steps = 5, pause = 350) {
  const step = Math.trunc(distance / steps);
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(pause);
  }
}

test.beforeEach(async ({ page }) => {
  await ensureOutputDir();
  await page.goto('/');
  await page.waitForSelector('text=Record source');
  await settle(page, 2200);
});

test('polished reporting-access showcase', async ({ page }) => {
  await resetDemo(page);
  await selectSource(page, 'runtime:reporting-access');

  await settle(page, 2200);
  await smoothScroll(page, 220, 4, 400);
  await settle(page, 1200);
  await smoothScroll(page, 420, 6, 350);
  await settle(page, 1200);
  await page.locator('text=Workflow rail').scrollIntoViewIfNeeded();
  await settle(page, 1800);
  await smoothScroll(page, 380, 5, 350);
  await settle(page, 1400);
  await page.locator('text=Action timeline').scrollIntoViewIfNeeded();
  await settle(page, 1800);
  await smoothScroll(page, -900, 8, 280);
  await settle(page, 1500);

  await page.getByRole('button', { name: 'Approve' }).click();
  await settle(page, 700);
  await page.locator('section').filter({ hasText: 'Approval and control' }).getByRole('button', { name: 'Confirm', exact: true }).click();
  await waitForCompletion(page, 15000);
  await settle(page, 2500);

  await smoothScroll(page, 650, 6, 320);
  await settle(page, 1800);
  await smoothScroll(page, 260, 4, 400);
  await settle(page, 1800);
});

test('polished vpn-policy showcase', async ({ page }) => {
  await selectSource(page, 'runtime:vpn-policy-change');
  await settle(page, 1800);

  await smoothScroll(page, 180, 3, 450);
  await settle(page, 1000);
  await page.locator('text=Operator flow and authority').scrollIntoViewIfNeeded();
  await settle(page, 2000);
  await smoothScroll(page, 500, 6, 320);
  await settle(page, 1400);
  await page.locator('text=Execution envelope').scrollIntoViewIfNeeded();
  await settle(page, 2200);
  await smoothScroll(page, 280, 4, 350);
  await settle(page, 1400);
  await page.locator('text=Action timeline').scrollIntoViewIfNeeded();
  await settle(page, 2000);
});
