import { test, expect } from '@playwright/test';

test('Privacy Policy link works', async ({ page }) => {
  await page.goto('http://localhost:4173/');

  // Wait for home page to load
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

  await page.getByRole('link', { name: 'Privacy Policy' }).click();
  await page.getByRole('heading', { name: 'Privacy Policy' }).click();
});