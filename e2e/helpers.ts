import { Page } from '@playwright/test';

/**
 * Logs in as admin and navigates to the given path.
 */
export async function loginAsAdmin(page: Page, redirectTo = '/pipeline') {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('chainrx-auth'));
  await page.reload();

  await page.getByRole('button', { name: /admin/i }).first().click();
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/pipeline/, { timeout: 5000 });

  if (redirectTo !== '/pipeline') {
    await page.goto(redirectTo);
  }
}

/**
 * Logs in as auditor (read-only).
 */
export async function loginAsAuditor(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('chainrx-auth'));
  await page.reload();

  await page.getByRole('button', { name: /auditor/i }).first().click();
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/pipeline/, { timeout: 5000 });
}
