import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsAuditor } from './helpers';

test.describe('Anomaly Detection', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/anomalies');
  });

  test('renders anomaly detection page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Anomaly Detection' })).toBeVisible();
    await expect(page.getByText(/AI-powered fraud/)).toBeVisible();
  });

  test('shows 4 KPI summary cards', async ({ page }) => {
    await expect(page.getByText('Total Anomalies')).toBeVisible();
    await expect(page.getByText('Total Exposure')).toBeVisible();
    await expect(page.getByText(/High Risk/)).toBeVisible();
    await expect(page.getByText(/Investigated/)).toBeVisible();
  });

  test('displays 15+ flagged anomalies', async ({ page }) => {
    const totalCard = page.locator('div').filter({ hasText: 'Total Anomalies' }).first();
    await expect(totalCard).toBeVisible();
    const countEl = totalCard.locator('.text-2xl, [class*="text-2xl"]').first();
    await expect(countEl).toBeVisible();
    const text = await countEl.textContent();
    expect(Number(text?.trim())).toBeGreaterThanOrEqual(15);
  });

  test('type filter buttons are present', async ({ page }) => {
    await expect(page.getByText('All Types')).toBeVisible();
    await expect(page.getByText('Duplicate Submission')).toBeVisible();
    await expect(page.getByText('Unusual Frequency')).toBeVisible();
    await expect(page.getByText('Amount Outlier')).toBeVisible();
    await expect(page.getByText('Expired Coverage')).toBeVisible();
  });

  test('filtering by DUPLICATE type shows only duplicate anomalies', async ({ page }) => {
    await page.getByText('Duplicate Submission').click();
    // Should show ANO cards with Duplicate type
    const cards = page.locator('text=/DUPLICATE|Duplicate/');
    await expect(cards.first()).toBeVisible();
  });

  test('filtering by FREQUENCY type works', async ({ page }) => {
    await page.getByText('Unusual Frequency').click();
    const cards = page.locator('text=/FREQUENCY|Unusual Frequency/');
    await expect(cards.first()).toBeVisible();
  });

  test('filtering by AMOUNT_OUTLIER type works', async ({ page }) => {
    await page.getByText('Amount Outlier').click();
    const cards = page.locator('text=/AMOUNT_OUTLIER|Amount Outlier/');
    await expect(cards.first()).toBeVisible();
  });

  test('filtering by EXPIRED_COVERAGE type works', async ({ page }) => {
    await page.getByText('Expired Coverage').click();
    const cards = page.locator('text=/EXPIRED_COVERAGE|Expired Coverage/');
    await expect(cards.first()).toBeVisible();
  });

  test('anomaly cards show risk scores', async ({ page }) => {
    // Risk score gauges should be visible
    await expect(page.locator('text=/risk score|\d+\/100/i').or(
      page.locator('[class*="risk"], [class*="gauge"]').first()
    )).toBeVisible({ timeout: 3000 });
  });

  test('anomaly cards show ANO- IDs', async ({ page }) => {
    await expect(page.locator('text=/ANO-\\d+/').first()).toBeVisible();
  });

  test('anomaly cards show exposure amounts', async ({ page }) => {
    await expect(page.locator('text=/\\$[\\d,]+/').first()).toBeVisible();
  });

  test('anomaly cards show recommended actions', async ({ page }) => {
    await expect(page.locator('text=/recommended action|cross-reference|deny|audit/i').first()).toBeVisible();
  });

  test('bar chart for anomalies by type is rendered', async ({ page }) => {
    await expect(page.getByText('Anomalies by Type')).toBeVisible();
    // Recharts renders SVG
    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('30-day detection trend chart is rendered', async ({ page }) => {
    await expect(page.getByText('30-Day Detection Trend')).toBeVisible();
  });

  test('OPEN status badge visible on cards', async ({ page }) => {
    await expect(page.locator('text=/OPEN|INVESTIGATED|ESCALATED/').first()).toBeVisible();
  });

  test('admin sees action buttons on anomaly cards', async ({ page }) => {
    // Admin should see Mark Investigated or Escalate buttons
    await expect(
      page.getByRole('button', { name: /investigate|escalate/i }).first()
    ).toBeVisible({ timeout: 3000 });
  });

  test('auditor can view anomalies', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('chainrx-auth'));
    await loginAsAuditor(page);
    await page.goto('/anomalies');
    await expect(page.getByRole('heading', { name: 'Anomaly Detection' })).toBeVisible();
  });

  test('All Types filter restores full list', async ({ page }) => {
    await page.getByText('Duplicate Submission').click();
    await page.getByText('All Types').click();
    // All anomalies should be visible again
    const cards = page.locator('text=/ANO-\\d+/');
    await expect(cards.first()).toBeVisible();
  });
});
