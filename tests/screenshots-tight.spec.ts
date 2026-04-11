import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'screenshots', 'tight-pass');

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function settle(page: Parameters<typeof test>[0]['page']) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1600);
}

async function selectSource(page: Parameters<typeof test>[0]['page'], value: string) {
  const select = page.locator('select').first();
  await expect(select).toBeVisible();
  await select.selectOption(value);
  await settle(page);
}

async function hideChrome(page: Parameters<typeof test>[0]['page']) {
  await page.evaluate(() => {
    const selectors = [
      'section:has-text("Record source")',
      'text=Demo framing',
      'button:has-text("Reset demo state")',
      'section:has-text("Mode switch")',
      'section:has-text("Live execution")'
    ];

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll('*')).filter((el) => el.textContent?.includes(selector.replace(/^.*\("|"\).*$/g, '')));
      elements.slice(0, 1).forEach((el) => {
        const section = el.closest('section, div');
        if (section instanceof HTMLElement) section.style.display = 'none';
      });
    }

    document.body.style.overflowX = 'hidden';
  });
}

test.beforeEach(async ({ page }) => {
  await ensureOutputDir();
  await page.goto('/');
  await page.waitForSelector('text=Record source');
  await settle(page);
  await hideChrome(page);
});

test('capture tighter TrustPlane website shots', async ({ page }) => {
  await selectSource(page, 'runtime:reporting-access');
  await page.locator('h1').first().scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'request-hero.png'), fullPage: false });

  await page.locator('text=Workflow rail').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'workflow-rail-tight.png'), fullPage: false });

  await selectSource(page, 'runtime:vpn-policy-change');
  await page.locator('text=Action timeline').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'timeline-evidence-tight.png'), fullPage: false });
});
