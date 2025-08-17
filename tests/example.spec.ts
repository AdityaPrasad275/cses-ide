import { test, expect } from '@playwright/test';

test('happy path', async ({ page }) => {
  await page.goto('/');

  // Check for default code
  await expect(page.locator('textarea.input')).toHaveValue('');

  // Enter input
  await page.locator('textarea.input').fill('5');

  // Run code
  await page.getByRole('button', { name: 'Run' }).click();

  // Check for output
  await expect(page.locator('textarea.output')).toHaveValue('Hello, World! 5');
});

test('compilation error', async ({ page }) => {
    await page.goto('/');
  
    // Enter code with compilation error
    const editor = page.locator('.monaco-editor textarea');
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('invalid code');
  
    // Run code
    await page.getByRole('button', { name: 'Run' }).click();
  
    // Check for error message
    await expect(page.locator('textarea.output')).toContainText('error');
  });
