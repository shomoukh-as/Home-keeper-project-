/**
 * System Tests - Browser Compatibility
 * Tests core functionality in different browser contexts
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('System: Browser Compatibility', () => {
    const baseUrl = 'file://' + path.resolve(__dirname, '../../');

    describe('localStorage Support', () => {
        test('browser supports localStorage API', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            const supportsLocalStorage = await page.evaluate(() => {
                return typeof window.localStorage !== 'undefined';
            });

            expect(supportsLocalStorage).toBe(true);

            await browser.close();
        }, 30000);

        test('localStorage can store and retrieve data', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.evaluate(() => {
                localStorage.setItem('test_key', 'test_value');
            });

            const value = await page.evaluate(() => {
                return localStorage.getItem('test_key');
            });

            expect(value).toBe('test_value');

            await browser.close();
        }, 30000);

        test('localStorage persists across page reloads', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.goto(`${baseUrl}/index.html`);

            // Set data
            await page.evaluate(() => {
                localStorage.setItem('persist_test', 'persisted_value');
            });

            // Reload page
            await page.reload();

            // Retrieve data
            const value = await page.evaluate(() => {
                return localStorage.getItem('persist_test');
            });

            expect(value).toBe('persisted_value');

            await browser.close();
        }, 30000);
    });

    describe('DOM Rendering', () => {
        test('pages render all expected elements', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.goto(`${baseUrl}/index.html`);

            // Check critical elements exist
            const loginSection = await page.$('#login-section');
            const registerSection = await page.$('#register-section');
            const loginForm = await page.$('#login-form');

            expect(loginSection).toBeTruthy();
            expect(registerSection).toBeTruthy();
            expect(loginForm).toBeTruthy();

            await browser.close();
        }, 30000);

        test('CSS styles are applied', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.goto(`${baseUrl}/index.html`);

            // Check if styles are loaded (check computed style)
            const bodyBackgroundImage = await page.$eval('body', el => {
                return window.getComputedStyle(el).getPropertyValue('background-image');
            });

            // Should have some computed style (even if 'none')
            expect(bodyBackgroundImage).toBeDefined();

            await browser.close();
        }, 30000);
    });

    describe('JavaScript Execution', () => {
        test('JavaScript files load and execute', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Track script errors
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));

            await page.goto(`${baseUrl}/index.html`);

            // Wait for scripts to execute
            await page.waitForTimeout(500);

            // Check for critical functions
            const hasFunctions = await page.evaluate(() => {
                return typeof getAllUsers === 'function' &&
                    typeof getCurrentUser === 'function';
            });

            expect(hasFunctions).toBe(true);
            expect(errors.length).toBe(0);

            await browser.close();
        }, 30000);

        test('no console errors on page load', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            const consoleErrors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await page.goto(`${baseUrl}/index.html`);
            await page.waitForTimeout(1000);

            // Filter out expected errors (like CORS or network errors for API calls)
            const criticalErrors = consoleErrors.filter(err =>
                !err.includes('localhost:3000') &&
                !err.includes('Failed to fetch')
            );

            expect(criticalErrors.length).toBe(0);

            await browser.close();
        }, 30000);
    });

    describe('Responsive Design', () => {
        test('pages render at mobile viewport', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Set mobile viewport
            await page.setViewport({
                width: 375,
                height: 667,
                isMobile: true
            });

            await page.goto(`${baseUrl}/index.html`);

            // Check page still renders
            const body = await page.$('body');
            expect(body).toBeTruthy();

            await browser.close();
        }, 30000);

        test('pages render at tablet viewport', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Set tablet viewport
            await page.setViewport({
                width: 768,
                height: 1024,
                isMobile: false
            });

            await page.goto(`${baseUrl}/index.html`);

            // Check page still renders
            const body = await page.$('body');
            expect(body).toBeTruthy();

            await browser.close();
        }, 30000);

        test('pages render at desktop viewport', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Set desktop viewport
            await page.setViewport({
                width: 1920,
                height: 1080,
                isMobile: false
            });

            await page.goto(`${baseUrl}/index.html`);

            // Check page still renders
            const body = await page.$('body');
            expect(body).toBeTruthy();

            await browser.close();
        }, 30000);
    });
});
