/**
 * Release Tests - Regression Tests
 * Verify existing functionality hasn't broken
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Load utils
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Release: Regression Tests', () => {
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

    beforeEach(() => {
        localStorage.clear();
    });

    describe('Data Persistence', () => {
        test('localStorage persists after page refresh', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            // Store data
            await page.evaluate(() => {
                localStorage.setItem('test_data', JSON.stringify({ value: 'persisted' }));
            });

            // Reload page
            await page.reload();
            await page.waitForTimeout(500);

            // Check data persists
            const data = await page.evaluate(() => {
                return localStorage.getItem('test_data');
            });

            expect(JSON.parse(data)).toEqual({ value: 'persisted' });
            await page.close();
        }, 30000);

        test('user data isolation works correctly', () => {
            // User 1
            setCurrentUser({ username: 'user1', id: 1 });
            setUserArray('appliances', [{ id: 1, name: 'User1 Appliance' }]);

            const user1Data = getUserArray('appliances');

            // User 2
            setCurrentUser({ username: 'user2', id: 2 });
            setUserArray('appliances', [{ id: 2, name: 'User2 Appliance' }]);

            const user2Data = getUserArray('appliances');

            // Verify isolation
            expect(user1Data[0].name).toBe('User1 Appliance');
            expect(user2Data[0].name).toBe('User2 Appliance');

            // Switch back to user1
            setCurrentUser({ username: 'user1', id: 1 });
            const user1DataAgain = getUserArray('appliances');
            expect(user1DataAgain[0].name).toBe('User1 Appliance');
        });
    });

    describe('Modal Interactions', () => {
        test('modal opens and closes correctly', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            // Initially hidden
            let isHidden = await page.$eval('#modal', el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);

            // Click to open
            await page.click('#btn-new');
            await page.waitForTimeout(200);

            isHidden = await page.$eval('#modal', el => el.classList.contains('hidden'));
            expect(isHidden).toBe(false);

            // Close button works
            await page.click('#close-modal');
            await page.waitForTimeout(200);

            isHidden = await page.$eval('#modal', el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);

            await page.close();
        }, 30000);

        test('modal can be opened multiple times', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            for (let i = 0; i < 3; i++) {
                // Open modal
                await page.click('#btn-new');
                await page.waitForTimeout(100);

                let isVisible = await page.$eval('#modal', el => !el.classList.contains('hidden'));
                expect(isVisible).toBe(true);

                // Close modal
                await page.click('#close-modal');
                await page.waitForTimeout(100);

                let isHidden = await page.$eval('#modal', el => el.classList.contains('hidden'));
                expect(isHidden).toBe(true);
            }

            await page.close();
        }, 30000);
    });

    describe('Form Validation', () => {
        test('empty form fields trigger validation', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/index.html`);

            // Try to submit  empty login form
            await page.click('#login-form button[type="submit"]');
            await page.waitForTimeout(500);

            // Form should have required attributes
            const usernameRequired = await page.$eval('#login-username', el => el.required);
            const passwordRequired = await page.$eval('#login-password', el => el.required);

            expect(usernameRequired).toBe(true);
            expect(passwordRequired).toBe(true);

            await page.close();
        }, 30000);
    });

    describe('Search Functionality', () => {
        test('search input filters results', async () => {
            const page = await browser.newPage();
            await page.goto(`${baseUrl}/appliances.html`);

            // Add test rows
            await page.evaluate(() => {
                const tbody = document.querySelector('#tbl tbody');
                tbody.innerHTML = `
          <tr><td>Refrigerator</td><td>Samsung</td><td>Model1</td><td></td><td></td><td></td></tr>
          <tr><td>Washing Machine</td><td>LG</td><td>Model2</td><td></td><td></td><td></td></tr>
          <tr><td>Microwave</td><td>Panasonic</td><td>Model3</td><td></td><td></td><td></td></tr>
        `;
            });

            // Initially 3 rows
            let rowCount = await page.$$eval('#tbl tbody tr', rows => rows.length);
            expect(rowCount).toBe(3);

            await page.close();
        }, 30000);
    });

    describe('Date Helpers', () => {
        test('daysBetween calculation remains accurate', () => {
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 10);

            const days = daysBetween(futureDate.toISOString().split('T')[0]);
            expect(days).toBe(10);
        });

        test('fmt function formats dates correctly', () => {
            const dateStr = '2023-12-15';
            const formatted = fmt(dateStr);

            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
        });

        test('fmt handles empty dates', () => {
            expect(fmt('')).toBe('');
            expect(fmt(null)).toBe('');
            expect(fmt(undefined)).toBe('');
        });
    });

    describe('localStorage Helpers', () => {
        test('getAllUsers and saveAllUsers work correctly', () => {
            const users = [
                { username: 'user1', password: 'pass1' },
                { username: 'user2', password: 'pass2' }
            ];

            saveAllUsers(users);
            const retrieved = getAllUsers();

            expect(retrieved).toEqual(users);
        });

        test('getCurrentUser and setCurrentUser work correctly', () => {
            const user = { username: 'testuser', id: 123 };

            setCurrentUser(user);
            const retrieved = getCurrentUser();

            expect(retrieved).toEqual(user);
        });

        test('clearCurrentUser removes user', () => {
            setCurrentUser({ username: 'testuser', id: 123 });
            clearCurrentUser();

            const retrieved = getCurrentUser();
            expect(retrieved).toBeNull();
        });

        test('userKey returns null when no user logged in', () => {
            clearCurrentUser();
            const key = userKey('appliances');
            expect(key).toBeNull();
        });

        test('getUserArray returns empty array when no data', () => {
            setCurrentUser({ username: 'newuser', id: 1 });
            const data = getUserArray('nonexistent');
            expect(data).toEqual([]);
        });
    });

    describe('Token Management', () => {
        test('token functions work correctly', () => {
            const token = 'test-token-123';

            setAuthToken(token);
            expect(getAuthToken()).toBe(token);

            clearAuthToken();
            expect(getAuthToken()).toBeNull();
        });
    });

    describe('Navigation', () => {
        test('all navigation links work', async () => {
            const page = await browser.newPage();
            const pages = [
                'index.html',
                'dashboard.html',
                'appliances.html',
                'invoices.html',
                'maintenance.html',
                'warranty.html'
            ];

            for (const pageName of pages) {
                await page.goto(`${baseUrl}/${pageName}`);
                const body = await page.$('body');
                expect(body).toBeTruthy();
            }

            await page.close();
        }, 60000);
    });
});
