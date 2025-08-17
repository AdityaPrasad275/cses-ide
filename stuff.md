# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name:  >> handles code waiting for input
- Location: example.spec.ts:87:5

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Run")')
    - locator resolved to <button>Run</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms


   98 |     }
   99 |   `);
> 100 |   await page.click('button:has-text("Run")');
      |              ^
  101 |   const output = page.locator('pre');
  102 |   // Since there's no input, the program should terminate quickly with "Hello, !"
  103 |   await expect(output).toContainText('Hello, !', { timeout: 7000 });
    at C:\Personal_files\programming\web_dev\cses-ide\tests\example.spec.ts:100:14
```
# Page snapshot

```yaml
- 'heading "Problem: Missing Number" [level=2]'
- paragraph: You are given all numbers between 1, 2, ..., n except one. Your task is to find the missing number.
- heading "Input" [level=3]
- paragraph: The first input line contains an integer n.
- paragraph: The second line contains n-1 numbers. Each number is distinct and between 1 and n (inclusive).
- heading "Output" [level=3]
- paragraph: Print the missing number.
- code:
  - textbox "Editor content": "#include <iostream> #include <string> int main() { std::string name; std::cin >> name; std::cout << \"Hello, \" << name << \"!\"; return 0; } #include <iostream>"
- button "Console"
- alert
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('happy path', async ({ page }) => {
   4 |   await page.goto('/');
   5 |
   6 |   // Open the console drawer to make I/O areas visible
   7 |   await page.getByRole('button', { name: 'Console' }).click();
   8 |
   9 |   const inputArea = page.getByPlaceholder('Enter input here...');
   10 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   11 |
   12 |   // Check for default code
   13 |   await expect(inputArea).toHaveValue('');
   14 |
   15 |   // Enter input
   16 |   await inputArea.fill('5');
   17 |
   18 |   // Run code
   19 |   await page.getByRole('button', { name: 'Run' }).click();
   20 |
   21 |   // Check for output
   22 |   await expect(outputArea).toHaveValue('Hello, World!');
   23 | });
   24 |
   25 | test('compilation error', async ({ page }) => {
   26 |   await page.goto('/');
   27 |
   28 |   // Open the console drawer to make the Run button visible
   29 |   await page.getByRole('button', { name: 'Console' }).click();
   30 |   
   31 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   32 |
   33 |   // Click the editor to focus it, then type.
   34 |   await page.locator('.monaco-editor').click();
   35 |   await page.keyboard.press('Control+A');
   36 |   await page.keyboard.type('invalid code');
   37 |
   38 |   // Run code
   39 |   await page.getByRole('button', { name: 'Run' }).click();
   40 |
   41 |   // Check for error message
   42 |   await expect(outputArea).toContainText('error');
   43 | });
   44 |
   45 | test('handles user input correctly', async ({ page }) => {
   46 |   await page.goto('/');
   47 |   await page.getByRole('button', { name: 'Console' }).click();
   48 |
   49 |   const code = [
   50 |     '#include <iostream>',
   51 |     '#include <string>',
   52 |     'int main() {',
   53 |     '    std::string name;',
   54 |     '    std::cin >> name;',
   55 |     '    std::cout << "Hello, " << name << "!";',
   56 |     '    return 0;',
   57 |     '}'
   58 |   ].join('\n');
   59 |
   60 |   await expect(page.getByText('Loading...')).toBeHidden();
   61 |   await page.evaluate((code) => {
   62 |     (window as any).monaco.editor.getModels()[0].setValue(code);
   63 |   }, code);
   64 |
   65 |   await page.getByPlaceholder('Enter input here...').fill('Gemini');
   66 |   await page.getByRole('button', { name: 'Run' }).click();
   67 |
   68 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   69 |   await expect(outputArea).toHaveValue('Hello, Gemini!');
   70 | });
   71 |
   72 | test('handles infinite loop', async ({ page }) => {
   73 |   await page.goto('http://localhost:5173');
   74 |   const editor = page.locator('.monaco-editor textarea');
   75 |   await editor.fill(`
   76 |     #include <iostream>
   77 |     int main() {
   78 |       while(true) {}
   79 |       return 0;
   80 |     }
   81 |   `);
   82 |   await page.click('button:has-text("Run")');
   83 |   const output = page.locator('pre');
   84 |   await expect(output).toContainText('timed out', { timeout: 7000 });
   85 | });
   86 |
   87 | test('handles code waiting for input', async ({ page }) => {
   88 |   await page.goto('http://localhost:5173');
   89 |   const editor = page.locator('.monaco-editor textarea');
   90 |   await editor.fill(`
   91 |     #include <iostream>
   92 |     #include <string>
   93 |     int main() {
   94 |       std::string name;
   95 |       std::cin >> name;
   96 |       std::cout << "Hello, " << name << "!";
   97 |       return 0;
   98 |     }
   99 |   `);
> 100 |   await page.click('button:has-text("Run")');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  101 |   const output = page.locator('pre');
  102 |   // Since there's no input, the program should terminate quickly with "Hello, !"
  103 |   await expect(output).toContainText('Hello, !', { timeout: 7000 });
  104 | });
  105 |
  106 |
  107 |
  108 |
  109 |
  110 | //
```

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name:  >> handles infinite loop
- Location: example.spec.ts:72:5

# Error details

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Run")')
    - locator resolved to <button>Run</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    54 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms


  80 |     }
  81 |   `);
> 82 |   await page.click('button:has-text("Run")');
     |              ^
  83 |   const output = page.locator('pre');
  84 |   await expect(output).toContainText('timed out', { timeout: 7000 });
  85 | });
    at C:\Personal_files\programming\web_dev\cses-ide\tests\example.spec.ts:82:14
```
# Page snapshot

```yaml
- 'heading "Problem: Missing Number" [level=2]'
- paragraph: You are given all numbers between 1, 2, ..., n except one. Your task is to find the missing number.
- heading "Input" [level=3]
- paragraph: The first input line contains an integer n.
- paragraph: The second line contains n-1 numbers. Each number is distinct and between 1 and n (inclusive).
- heading "Output" [level=3]
- paragraph: Print the missing number.
- code:
  - textbox "Editor content": "#include <iostream> int main() { while(true) {} return 0; } #include <iostream> #include <vector> #include <string>"
- button "Console"
- alert
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('happy path', async ({ page }) => {
   4 |   await page.goto('/');
   5 |
   6 |   // Open the console drawer to make I/O areas visible
   7 |   await page.getByRole('button', { name: 'Console' }).click();
   8 |
   9 |   const inputArea = page.getByPlaceholder('Enter input here...');
   10 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   11 |
   12 |   // Check for default code
   13 |   await expect(inputArea).toHaveValue('');
   14 |
   15 |   // Enter input
   16 |   await inputArea.fill('5');
   17 |
   18 |   // Run code
   19 |   await page.getByRole('button', { name: 'Run' }).click();
   20 |
   21 |   // Check for output
   22 |   await expect(outputArea).toHaveValue('Hello, World!');
   23 | });
   24 |
   25 | test('compilation error', async ({ page }) => {
   26 |   await page.goto('/');
   27 |
   28 |   // Open the console drawer to make the Run button visible
   29 |   await page.getByRole('button', { name: 'Console' }).click();
   30 |   
   31 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   32 |
   33 |   // Click the editor to focus it, then type.
   34 |   await page.locator('.monaco-editor').click();
   35 |   await page.keyboard.press('Control+A');
   36 |   await page.keyboard.type('invalid code');
   37 |
   38 |   // Run code
   39 |   await page.getByRole('button', { name: 'Run' }).click();
   40 |
   41 |   // Check for error message
   42 |   await expect(outputArea).toContainText('error');
   43 | });
   44 |
   45 | test('handles user input correctly', async ({ page }) => {
   46 |   await page.goto('/');
   47 |   await page.getByRole('button', { name: 'Console' }).click();
   48 |
   49 |   const code = [
   50 |     '#include <iostream>',
   51 |     '#include <string>',
   52 |     'int main() {',
   53 |     '    std::string name;',
   54 |     '    std::cin >> name;',
   55 |     '    std::cout << "Hello, " << name << "!";',
   56 |     '    return 0;',
   57 |     '}'
   58 |   ].join('\n');
   59 |
   60 |   await expect(page.getByText('Loading...')).toBeHidden();
   61 |   await page.evaluate((code) => {
   62 |     (window as any).monaco.editor.getModels()[0].setValue(code);
   63 |   }, code);
   64 |
   65 |   await page.getByPlaceholder('Enter input here...').fill('Gemini');
   66 |   await page.getByRole('button', { name: 'Run' }).click();
   67 |
   68 |   const outputArea = page.getByPlaceholder('Output will be shown here...');
   69 |   await expect(outputArea).toHaveValue('Hello, Gemini!');
   70 | });
   71 |
   72 | test('handles infinite loop', async ({ page }) => {
   73 |   await page.goto('http://localhost:5173');
   74 |   const editor = page.locator('.monaco-editor textarea');
   75 |   await editor.fill(`
   76 |     #include <iostream>
   77 |     int main() {
   78 |       while(true) {}
   79 |       return 0;
   80 |     }
   81 |   `);
>  82 |   await page.click('button:has-text("Run")');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
   83 |   const output = page.locator('pre');
   84 |   await expect(output).toContainText('timed out', { timeout: 7000 });
   85 | });
   86 |
   87 | test('handles code waiting for input', async ({ page }) => {
   88 |   await page.goto('http://localhost:5173');
   89 |   const editor = page.locator('.monaco-editor textarea');
   90 |   await editor.fill(`
   91 |     #include <iostream>
   92 |     #include <string>
   93 |     int main() {
   94 |       std::string name;
   95 |       std::cin >> name;
   96 |       std::cout << "Hello, " << name << "!";
   97 |       return 0;
   98 |     }
   99 |   `);
  100 |   await page.click('button:has-text("Run")');
  101 |   const output = page.locator('pre');
  102 |   // Since there's no input, the program should terminate quickly with "Hello, !"
  103 |   await expect(output).toContainText('Hello, !', { timeout: 7000 });
  104 | });
  105 |
  106 |
  107 |
  108 |
  109 |
  110 | //
```