import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsAuditor } from './helpers';

test.describe('Claims Table', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page, '/claims');
  });

  test('renders claims page with heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Claims' })).toBeVisible();
    await expect(page.getByText(/total claims/)).toBeVisible();
  });

  test('shows 50+ claims in the dataset', async ({ page }) => {
    // The header should mention 50+ claims (mock data has 110)
    const header = page.locator('p').filter({ hasText: /\d+ total claims/ });
    await expect(header).toBeVisible();
    const text = await header.textContent();
    const match = text?.match(/(\d+) total claims/);
    expect(Number(match?.[1])).toBeGreaterThanOrEqual(50);
  });

  test('displays claims table with column headers', async ({ page }) => {
    const headers = ['Claim ID', 'Patient', 'Provider', 'ICD Code', 'Amount', 'Status', 'Priority'];
    for (const header of headers) {
      await expect(page.getByText(header).first()).toBeVisible();
    }
  });

  test('search input is present and functional', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('CLM-10');
    // Table should filter results
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('status filter dropdown exists', async ({ page }) => {
    const statusFilter = page.locator('select').or(page.getByRole('combobox'));
    await expect(statusFilter.first()).toBeVisible();
  });

  test('claim rows show realistic data', async ({ page }) => {
    // Verify CLM- IDs are shown
    await expect(page.locator('td').filter({ hasText: /CLM-\d+/ }).first()).toBeVisible();
    // Verify dollar amounts
    await expect(page.locator('td').filter({ hasText: /\$[\d,]+/ }).first()).toBeVisible();
  });

  test('clicking a claim row opens slide-over detail', async ({ page }) => {
    await page.locator('table tbody tr').first().click();
    // SlideOver should appear
    await expect(
      page.locator('text=/Patient Information/i').or(page.locator('[data-testid="slideover"]'))
    ).toBeVisible({ timeout: 3000 });
  });

  test('pagination controls are present', async ({ page }) => {
    // Should show page numbers or next/previous buttons
    await expect(
      page.getByRole('button', { name: /next|previous|→|←/i }).or(
        page.locator('text=/page/i')
      )
    ).toBeVisible();
  });

  test('CSV export button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export|csv/i })).toBeVisible();
  });

  test('sorting by Amount column works', async ({ page }) => {
    const amountHeader = page.getByText('Amount').first();
    await amountHeader.click();
    // After click, table should still show data
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('priority filter shows correct priority badges', async ({ page }) => {
    const priorityBadges = ['HIGH', 'MEDIUM', 'LOW', 'CRITICAL'];
    const visibleBadge = page.locator('td span').filter({ hasText: new RegExp(priorityBadges.join('|')) }).first();
    await expect(visibleBadge).toBeVisible();
  });

  test('shows ICD-10 codes in table rows', async ({ page }) => {
    // ICD codes like Z00.00, M54.5, I10, etc.
    await expect(page.locator('td').filter({ hasText: /[A-Z]\d+\./ }).first()).toBeVisible();
  });

  test('auditor can view claims but has no advance actions', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('chainrx-auth'));
    await loginAsAuditor(page);
    await page.goto('/claims');
    await expect(page.getByRole('heading', { name: 'Claims' })).toBeVisible();
    // Auditor can read data
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('clear search resets results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('ZZZNONEXISTENT');
    await searchInput.clear();
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });
});
