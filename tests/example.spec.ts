import { test, expect } from '@playwright/test';

test('happy path', async ({ page }) => {
  await page.goto('/');

  // Open the console drawer to make I/O areas visible
  await page.getByRole('button', { name: 'Console' }).click();

  const inputArea = page.getByPlaceholder('Enter input here...');
  const outputArea = page.getByPlaceholder('Output will be shown here...');

  // Check for default code
  await expect(inputArea).toHaveValue('');

  // Enter input
  await inputArea.fill('5');

  // Run code
  await page.getByRole('button', { name: 'Run' }).click();

  // Check for output
  await expect(outputArea).toHaveValue('Hello, World!');
});

test('compilation error', async ({ page }) => {
  await page.goto('/');

  // Open the console drawer to make the Run button visible
  await page.getByRole('button', { name: 'Console' }).click();
  
  const outputArea = page.getByPlaceholder('Output will be shown here...');

  // Click the editor to focus it, then type.
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('invalid code');

  // Run code
  await page.getByRole('button', { name: 'Run' }).click();

  // Check for error message
  await expect(outputArea).toContainText('error');
});

test('handles user input correctly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Console' }).click();

  const code = [
    '#include <iostream>',
    '#include <string>',
    'int main() {',
    '    std::string name;',
    '    std::cin >> name;',
    '    std::cout << "Hello, " << name << "!";',
    '    return 0;',
    '}'
  ].join('\n');

  await expect(page.getByText('Loading...')).toBeHidden();
  await page.evaluate((code) => {
    (window as any).monaco.editor.getModels()[0].setValue(code);
  }, code);

  await page.getByPlaceholder('Enter input here...').fill('Gemini');
  await page.getByRole('button', { name: 'Run' }).click();

  const outputArea = page.getByPlaceholder('Output will be shown here...');
  await expect(outputArea).toHaveValue('Hello, Gemini!');
});

test('handles infinite loop', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Console' }).click();

  const code = `
    #include <iostream>
    int main() {
      while(true) {}
      return 0;
    }
  `;
  await expect(page.getByText('Loading...')).toBeHidden();
  await page.evaluate((code) => {
    (window as any).monaco.editor.getModels()[0].setValue(code);
  }, code);

  await page.getByRole('button', { name: 'Run' }).click();
  const output = page.getByPlaceholder('Output will be shown here...');
  await expect(output).toHaveValue(/timed out/i, { timeout: 7000 });
});

test('handles code waiting for input', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Console' }).click();

  const code = `
    #include <iostream>
    #include <string>
    int main() {
      std::string name;
      std::cin >> name;
      std::cout << "Hello, " << name << "!";
      return 0;
    }
  `;
  await expect(page.getByText('Loading...')).toBeHidden();
  await page.evaluate((code) => {
    (window as any).monaco.editor.getModels()[0].setValue(code);
  }, code);
  
  await page.getByRole('button', { name: 'Run' }).click();
  const output = page.getByPlaceholder('Output will be shown here...');
  // Since there's no input, the program should terminate quickly with "Hello, !"
  await expect(output).toHaveValue('Hello, !', { timeout: 7000 });
});




