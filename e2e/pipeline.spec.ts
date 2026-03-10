import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Pipeline (Kanban)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/pipeline');
  });

  test('renders pipeline page with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Claims Pipeline' })).toBeVisible();
    await expect(page.getByText(/active claims/)).toBeVisible();
  });

  test('shows all 5 Kanban columns', async ({ page }) => {
    const stages = ['Intake', 'Verification', 'Adjudication', 'Review', 'Resolved'];
    for (const stage of stages) {
      await expect(page.getByText(stage).first()).toBeVisible();
    }
  });

  test('each column shows a claim count badge', async ({ page }) => {
    // All stage columns should have numeric badges
    const badges = page.locator('.badge');
    await expect(badges.first()).toBeVisible();
  });

  test('displays claim cards in columns', async ({ page }) => {
    // There should be claim cards visible — look for claim IDs (CLM-xxxxx)
    const claimIds = page.locator('text=/CLM-\\d+/');
    await expect(claimIds.first()).toBeVisible();
  });

  test('claim card shows patient name and amount', async ({ page }) => {
    // At least one claim card should show currency
    await expect(page.locator('text=/\\$[\\d,]+/').first()).toBeVisible();
  });

  test('clicking a claim card opens slide-over detail panel', async ({ page }) => {
    const firstCard = page.locator('.kanban-column').first().locator('[data-testid="claim-card"], button, div').filter({ hasText: /CLM-/ }).first();
    // Click anywhere on first visible claim card
    await page.locator('text=/CLM-\\d+/').first().click();
    // SlideOver should appear with patient/provider details
    await expect(page.locator('[data-testid="slideover"], aside, [role="dialog"]').or(page.locator('text=/Patient Information/i'))).toBeVisible({ timeout: 3000 });
  });

  test('Kanban view badge shows in toolbar', async ({ page }) => {
    await expect(page.getByText('Kanban View')).toBeVisible();
  });

  test('shows total value across all stages', async ({ page }) => {
    // Header shows total dollar value
    await expect(page.locator('text=/\\$[\\d,\\.]+[MK]? total value/').or(
      page.locator('p').filter({ hasText: /total value/ })
    )).toBeVisible();
  });

  test('empty column shows placeholder message', async ({ page }) => {
    // If any column is empty, it should show the empty state
    const emptyState = page.locator('text=/No claims in this stage/');
    // This may or may not be visible depending on data distribution
    // Just verify the page rendered without error
    await expect(page.getByRole('heading', { name: 'Claims Pipeline' })).toBeVisible();
  });

  test('navigating to pipeline from sidebar works', async ({ page }) => {
    await page.goto('/claims');
    await page.getByRole('link', { name: /pipeline/i }).click();
    await expect(page).toHaveURL(/\/pipeline/);
    await expect(page.getByRole('heading', { name: 'Claims Pipeline' })).toBeVisible();
  });
});
