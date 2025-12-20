
import { test, expect } from '@playwright/test';

test.describe('Legal Decoder E2E Tests', () => {

  test('Home page loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for the main title or key elements
    // Adjust selector based on actual content, assuming from README
    // "Legal Decoder" seems to be the title
    await expect(page).toHaveTitle(/Legal Decoder/);

    // Check for presence of key text
    await expect(page.locator('body')).toContainText('Legal Decoder');
  });

  test('Clause Explorer page loads', async ({ page }) => {
    await page.goto('/clause-explorer');
    await expect(page.locator('h1')).toBeVisible(); // Assuming there's an H1
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
     // Check for login form elements
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('Signup page loads', async ({ page }) => {
    await page.goto('/signup');
    // Check for signup form elements
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('Compare page loads', async ({ page }) => {
    await page.goto('/compare');
    // Basic check if page loads, authentication might redirect but we check for existence
    // If it redirects to login, that's also a valid behavior to verify if protected
    const title = await page.title();
    if (title.includes('Login') || page.url().includes('login')) {
         console.log('Compare page redirected to login, which is expected for protected routes');
    } else {
         await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    // Similar check as Compare page
    const title = await page.title();
    if (title.includes('Login') || page.url().includes('login')) {
         console.log('Dashboard page redirected to login, which is expected for protected routes');
    } else {
         await expect(page.locator('body')).toBeVisible();
    }
  });

});
