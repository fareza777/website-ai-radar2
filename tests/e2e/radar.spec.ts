import { test, expect } from '@playwright/test';
import { labs } from '../../src/config/labs';
test('English, readable text, twenty real logos, and all lab pages', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByTestId('lab-card')).toHaveCount(20);
  await expect(page.locator('.update-card').first()).toBeVisible();
  expect(await page.locator('.update-title').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(17);
  expect(await page.locator('.update-content > p').first().evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(15);
  for (const lab of labs) {
    const image = page.getByTestId('lab-card').filter({ has: page.getByRole('heading', { name: lab.name, exact: true }) }).locator('img');
    await expect(image).toBeVisible(); expect(await image.evaluate(e => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await page.screenshot({ path: `test-results/${testInfo.project.name}-today.png`, fullPage: true });
  expect(errors).toEqual([]);
});
for (const lab of labs) test(`lab route: ${lab.name}`, async ({ page }) => { await page.goto(`/labs/${lab.slug}`); await expect(page.locator('h1')).toHaveText(lab.name); await expect(page.locator('.lab-banner')).toBeVisible(); });
test('search, category, pagination, bookmarks, unread, and keyboard dialog', async ({ page }) => {
  await page.goto('/labs/openai');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(page.getByTestId('update-card').first()).toBeVisible();
  const title = await page.locator('.update-title').first().innerText();
  await page.locator('.bookmark').first().click();
  await page.locator('.update-title').first().click();
  await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByRole('heading', { name: 'What this means for you' })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Unread', exact: true }).click(); await expect(page.locator('.update-title').filter({ hasText: title })).toHaveCount(0);
  await page.getByRole('button', { name: 'Unread', exact: true }).click();
  await page.getByRole('button', { name: 'Next page', exact: true }).click(); await expect(page.locator('.pagination')).toContainText('13–');
  await page.getByRole('button', { name: 'Filter categories and date range' }).click();
  await page.getByLabel('Category', { exact: true }).selectOption('Developer');
  for (const badge of await page.locator('.update-card .category').all()) await expect(badge).toHaveText('Developer');
  await page.getByLabel('Category', { exact: true }).selectOption('all');
  await page.getByLabel('Global search').fill('zzzzz-no-matching-signal-xxxxx'); await expect(page.getByText('No signals match these filters.')).toBeVisible();
  await page.goto('/saved'); await expect(page.locator('.update-title')).toHaveText(title); await page.reload(); await expect(page.locator('.update-title')).toHaveText(title);
  await page.locator('.bookmark').click(); await expect(page.getByText('Build your own signal library.')).toBeVisible();
});
test('all main views, theme persistence, mobile navigation, and no horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') { await page.getByRole('button', { name: 'Open navigation' }).click(); await expect(page.locator('.sidebar')).toHaveClass(/open/); await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'AI Labs' }).click(); await expect(page).toHaveURL(/\/labs$/); }
  const toggle = page.getByRole('button', { name: testInfo.project.name === 'mobile' ? 'Toggle theme' : 'Switch to light mode' });
  await toggle.click(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light'); await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  for (const route of ['/', '/labs', '/discover', '/deals', '/saved', '/labs/openai']) {
    await page.goto(route); await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} horizontal overflow`).toBe(true);
    expect(await page.locator('main').innerText()).not.toMatch(/Belum|Tidak ada|Sinyal komunitas|Manfaat praktis|Harga belum/);
  }
  await page.goto('/'); await page.screenshot({ path: `test-results/${testInfo.project.name}-light.png`, fullPage: true });
  await page.getByRole('button', { name: 'Read daily briefing' }).click(); await expect(page.getByRole('dialog', { name: 'AI Daily Briefing' })).toBeVisible(); await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Source transparency', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Source transparency' })).toBeVisible(); await expect(page.locator('.source-row')).not.toHaveCount(0);
});
