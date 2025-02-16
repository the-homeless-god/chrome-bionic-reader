import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import fs from 'fs';

const TEST_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Test Page</title>
    <meta charset="UTF-8">
  </head>
  <body>
    <div id="content">
      <h1>Test Content</h1>
      <p>This is a test page with some русский текст for testing. Здесь находится тестовый контент.</p>
      <div>Another element with русские слова to process. Еще немного текста для обработки.</div>
      <ul>
        <li>Первый элемент списка</li>
        <li>Second list item</li>
        <li>Третий элемент списка</li>
      </ul>
    </div>
  </body>
</html>
`;

describe('Extension E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let testPagePath: string;

  beforeAll(async () => {
    const pathToExtension = path.join(process.cwd(), 'dist');
    testPagePath = path.join(process.cwd(), 'test-page.html');

    fs.writeFileSync(testPagePath, TEST_HTML, 'utf-8');

    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for extension to initialize
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
    fs.unlinkSync(testPagePath);
  });

  test('processes text on page load', async () => {
    const hasFormattedText = await page.evaluate(() => {
      const content = document.querySelector('#content');
      return content?.innerHTML.includes('<b>') || false;
    });

    expect(hasFormattedText).toBe(true);

    // Verify specific text formatting
    const formattedText = await page.evaluate(() => {
      const paragraphs = Array.from(document.querySelectorAll('p, div, li'));
      return paragraphs.map((p) => p.innerHTML);
    });

    expect(formattedText.some((text) => text.includes('<b>'))).toBe(true);
  });

  test('updates statistics in popup', async () => {
    const extensionId = await page.evaluate(() => {
      const extensionElement = document.querySelector('html');
      return extensionElement?.getAttribute('data-extension-id');
    });

    if (!extensionId) {
      throw new Error('Extension ID not found');
    }

    const popup = await browser.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#processedWords');

    const stats = await popup.evaluate(() => {
      const processedWords = document.getElementById('processedWords')?.textContent;
      const averageTime = document.getElementById('averageTime')?.textContent;
      const sessionInfo = document.getElementById('sessionInfo')?.textContent;
      return { processedWords, averageTime, sessionInfo };
    });

    expect(stats.processedWords).toBeDefined();
    expect(stats.averageTime).toBeDefined();
    expect(stats.sessionInfo).toBeDefined();

    await popup.close();
  });

  test('toggles text processing', async () => {
    // First check that text is formatted
    const initialFormatting = await page.evaluate(() => {
      const content = document.querySelector('#content');
      return content?.innerHTML.includes('<b>') || false;
    });
    expect(initialFormatting).toBe(true);

    // Get extension ID and interact with extension button
    const extensionId = await page.evaluate(() => {
      const extensionElement = document.querySelector('html');
      return extensionElement?.getAttribute('data-extension-id');
    });

    if (!extensionId) {
      throw new Error('Extension ID not found');
    }

    // Click extension icon (this might need to be handled differently)
    await page.evaluate(() => {
      chrome.runtime.sendMessage({ type: 'getState' });
    });

    await page.waitForFunction(
      () => {
        const content = document.querySelector('#content');
        return !content?.innerHTML.includes('<b>');
      },
      { timeout: 5000 }
    );

    // Check that formatting is removed
    const hasFormattedText = await page.evaluate(() => {
      const content = document.querySelector('#content');
      return content?.innerHTML.includes('<b>') || false;
    });

    expect(hasFormattedText).toBe(false);
  });
});
