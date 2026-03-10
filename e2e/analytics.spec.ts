import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/analytics');
  });

  test('renders analytics page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
    await expect(page.getByText(/Claims performance and operational intelligence/)).toBeVisible();
  });

  test('shows 4 KPI cards', async ({ page }) => {
    await expect(page.getByText('Total Processed')).toBeVisible();
    await expect(page.getByText('Approval Rate')).toBeVisible();
    await expect(page.getByText('Avg Days to Resolution')).toBeVisible();
    await expect(page.getByText('Total Paid Out')).toBeVisible();
  });

  test('Total Processed KPI shows a number', async ({ page }) => {
    const kpiCard = page.locator('div').filter({ hasText: 'Total Processed' }).first();
    await expect(kpiCard).toBeVisible();
    const value = kpiCard.locator('.text-2xl, [class*="text-2xl"]').first();
    await expect(value).toBeVisible();
    const text = await value.textContent();
    expect(Number(text?.replace(/,/g, ''))).toBeGreaterThan(0);
  });

  test('Approval Rate KPI shows a percentage', async ({ page }) => {
    const kpiCard = page.locator('div').filter({ hasText: 'Approval Rate' }).first();
    const value = kpiCard.locator('.text-2xl, [class*="text-2xl"]').first();
    await expect(value).toBeVisible();
    const text = await value.textContent();
    expect(text).toMatch(/%/);
  });

  test('claims volume line chart is rendered', async ({ page }) => {
    await expect(page.getByText('Claims Volume — Last 12 Months')).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('claims by status donut chart is rendered', async ({ page }) => {
    await expect(page.getByText('Claims by Status')).toBeVisible();
  });

  test('top providers bar chart is rendered', async ({ page }) => {
    await expect(page.getByText('Top Providers by Volume')).toBeVisible();
  });

  test('processing time chart is rendered', async ({ page }) => {
    await expect(page.getByText('Avg Processing Time by Stage')).toBeVisible();
  });

  test('status distribution shows all pipeline stages', async ({ page }) => {
    const stages = ['INTAKE', 'VERIFICATION', 'ADJUDICATION', 'REVIEW', 'RESOLVED'];
    for (const stage of stages) {
      await expect(page.locator('text=' + stage).first()).toBeVisible();
    }
  });

  test('provider names visible in chart or legend', async ({ page }) => {
    // At least one provider should appear
    await expect(
      page.locator('text=/Lakeside|Northwest|Valley|Metro|Pinnacle/').first()
    ).toBeVisible();
  });

  test('charts render SVG elements', async ({ page }) => {
    const svgs = page.locator('svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('navigating from pipeline to analytics works', async ({ page }) => {
    await page.goto('/pipeline');
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });
});
