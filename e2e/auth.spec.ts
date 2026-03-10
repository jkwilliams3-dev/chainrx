import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure unauthenticated state
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('chainrx-auth'));
    await page.reload();
  });

  test('shows login page when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('ChainRx')).toBeVisible();
    await expect(page.getByText('Claims Intelligence Platform')).toBeVisible();
  });

  test('login form renders correctly', async ({ page }) => {
    await expect(page.getByPlaceholder('you@chainrx.io')).toBeVisible();
    await expect(page.getByPlaceholder('Enter password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows demo quick access buttons', async ({ page }) => {
    await expect(page.getByText('Demo Quick Access')).toBeVisible();
    await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reviewer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /auditor/i })).toBeVisible();
  });

  test('fills credentials when demo button clicked', async ({ page }) => {
    await page.getByRole('button', { name: /admin/i }).first().click();
    await expect(page.getByPlaceholder('you@chainrx.io')).toHaveValue('admin@chainrx.io');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('you@chainrx.io').fill('wrong@email.com');
    await page.getByPlaceholder('Enter password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 3000 });
  });

  test('successfully logs in as admin', async ({ page }) => {
    await page.getByRole('button', { name: /admin/i }).first().click();
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/pipeline/, { timeout: 5000 });
    await expect(page.getByText('Claims Pipeline')).toBeVisible();
  });

  test('successfully logs in as reviewer', async ({ page }) => {
    await page.getByRole('button', { name: /reviewer/i }).first().click();
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/pipeline/, { timeout: 5000 });
  });

  test('successfully logs in as auditor', async ({ page }) => {
    await page.getByRole('button', { name: /auditor/i }).first().click();
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/pipeline/, { timeout: 5000 });
  });

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Enter password');
    await passwordInput.fill('testpassword');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle button
    await page.locator('button[type="button"]').filter({ hasText: '' }).last().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('shows HIPAA compliance footer', async ({ page }) => {
    await expect(page.getByText(/HIPAA Compliant/)).toBeVisible();
  });

  test('logs out successfully', async ({ page }) => {
    // Login first
    await page.getByRole('button', { name: /admin/i }).first().click();
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/pipeline/, { timeout: 5000 });

    // Logout via sidebar
    await page.getByRole('button', { name: /sign out|logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
