/**
 * Release Tests - Smoke Tests
 * Quick tests to verify critical functionality works
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Release: Smoke Tests', () => {
    let browser;
    const baseUrl = 'file://' + path.resolve(__dirname, '../../');

    beforeAll(async () => {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    describe('Critical Page Loading', () => {
        test('index.html loads successfully', async () => {
            const page = await browser.newPage();
            const response = await page.goto(`${baseUrl}/index.html`);

            expect(response).toBeTruthy();

            const title = await page.title();
            expect(title).toContain('Home Keeper');

            await page.close();
        }, 30000);

        test('dashboard.html loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/dashboard.html`);

            const body = await page.$('body');
            expect(body).toBeTruthy();

            await page.close();
        }, 30000);

        test('appliances.html loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            const table = await page.$('#tbl');
            expect(table).toBeTruthy();

            await page.close();
        }, 30000);

        test('invoices.html loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/invoices.html`);

            const table = await page.$('#tbl-inv');
            expect(table).toBeTruthy();

            await page.close();
        }, 30000);

        test('maintenance.html loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/maintenance.html`);

            const body = await page.$('body');
            expect(body).toBeTruthy();

            await page.close();
        }, 30000);

        test('warranty.html loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/warranty.html`);

            const table = await page.$('#tbl-w');
            expect(table).toBeTruthy();

            await page.close();
        }, 30000);
    });

    describe('Critical JavaScript Functions', () => {
        test('authentication functions are defined', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            const functionsExist = await page.evaluate(() => {
                return typeof registerUser === 'function' &&
                    typeof loginUser === 'function';
            });

            expect(functionsExist).toBe(true);
            await page.close();
        }, 30000);

        test('utility functions are defined', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            const functionsExist = await page.evaluate(() => {
                return typeof getAllUsers === 'function' &&
                    typeof getCurrentUser === 'function' &&
                    typeof setCurrentUser === 'function';
            });

            expect(functionsExist).toBe(true);
            await page.close();
        }, 30000);
    });

    describe('Critical UI Elements', () => {
        test('login form exists and has required fields', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            const loginForm = await page.$('#login-form');
            const usernameInput = await page.$('#login-username');
            const passwordInput = await page.$('#login-password');

            expect(loginForm).toBeTruthy();
            expect(usernameInput).toBeTruthy();
            expect(passwordInput).toBeTruthy();

            await page.close();
        }, 30000);

        test('appliances page has table and add button', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            const table = await page.$('#tbl');
            const addButton = await page.$('#btn-new');
            const searchInput = await page.$('#search');

            expect(table).toBeTruthy();
            expect(addButton).toBeTruthy();
            expect(searchInput).toBeTruthy();

            await page.close();
        }, 30000);

        test('modal component exists', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            const modal = await page.$('#modal');
            const closeButton = await page.$('#close-modal');

            expect(modal).toBeTruthy();
            expect(closeButton).toBeTruthy();

            await page.close();
        }, 30000);
    });

    describe('CSS Loading', () => {
        test('stylesheet loads successfully', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            const hasStylesheet = await page.evaluate(() => {
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                return links.length > 0;
            });

            expect(hasStylesheet).toBe(true);
            await page.close();
        }, 30000);
    });

    describe('No Console Errors', () => {
        test('index.html loads without critical errors', async () => {
            const page = await browser.newPage();

            const errors = [];
            page.on('pageerror', error => errors.push(error.message));

            await page.goto(`${baseUrl}/index.html`);
            await page.waitForTimeout(1000);

            // Filter out expected network errors for API calls
            const criticalErrors = errors.filter(err =>
                !err.includes('localhost:3000') &&
                !err.includes('Failed to fetch')
            );

            expect(criticalErrors.length).toBe(0);
            await page.close();
        }, 30000);
    });
});
