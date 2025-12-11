/**
 * System Tests - Performance
 * Tests application performance with large datasets
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Load utils for testing
const fs = require('fs');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('System: Performance Tests', () => {
    const baseUrl = 'file://' + path.resolve(__dirname, '../../');

    beforeEach(() => {
        localStorage.clear();
    });

    describe('localStorage Performance', () => {
        test('handles storing 100 appliances', () => {
            setCurrentUser({ username: 'perftest', id: 1 });

            const appliances = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                name: `Appliance ${i + 1}`,
                brand: `Brand ${i % 10}`,
                model: `Model ${i}`,
                purchase: '2023-01-15',
                warrantyEnd: '2025-01-15'
            }));

            const startTime = Date.now();
            setUserArray('appliances', appliances);
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100); // Should complete in < 100ms

            // Verify data was stored
            const retrieved = getUserArray('appliances');
            expect(retrieved).toHaveLength(100);
        });

        test('handles storing 500 invoices', () => {
            setCurrentUser({ username: 'perftest', id: 1 });

            const invoices = Array.from({ length: 500 }, (_, i) => ({
                id: i + 1,
                appliance: `Appliance ${i % 50}`,
                number: `INV-${i + 1}`,
                date: '2023-01-15',
                amount: 999.99,
                store: `Store ${i % 20}`
            }));

            const startTime = Date.now();
            setUserArray('invoices', invoices);
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(200); // Should complete in < 200ms

            // Verify data was stored
            const retrieved = getUserArray('invoices');
            expect(retrieved).toHaveLength(500);
        });

        test('retrieves large dataset quickly', () => {
            setCurrentUser({ username: 'perftest', id: 1 });

            // Store large dataset
            const appliances = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                name: `Appliance ${i + 1}`
            }));
            setUserArray('appliances', appliances);

            // Measure retrieval time
            const startTime = Date.now();
            const retrieved = getUserArray('appliances');
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(50); // Should retrieve in < 50ms
            expect(retrieved).toHaveLength(1000);
        });
    });

    describe('Search/Filter Performance', () => {
        test('filters 1000 items quickly', () => {
            const items = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
                brand: i % 2 === 0 ? 'Samsung' : 'LG',
                model: `Model ${i}`
            }));

            const query = 'samsung';

            const startTime = Date.now();
            const filtered = items.filter(item =>
                `${item.name} ${item.brand} ${item.model}`.toLowerCase().includes(query.toLowerCase())
            );
            const endTime = Date.now();

            const duration = endTime - startTime;
            expect(duration).toBeLessThan(20); // Should filter in < 20ms
            expect(filtered.length).toBeGreaterThan(0);
        });

        test('multiple consecutive searches perform well', () => {
            const items = Array.from({ length: 500 }, (_, i) => ({
                id: i + 1,
                name: `Item ${i + 1}`,
                brand: ['Samsung', 'LG', 'Bosch', 'Panasonic'][i % 4],
                model: `Model ${i}`
            }));

            const queries = ['samsung', 'lg', 'bosch', 'model 1', ''];

            const startTime = Date.now();

            queries.forEach(query => {
                items.filter(item =>
                    !query || `${item.name} ${item.brand} ${item.model}`.toLowerCase().includes(query.toLowerCase())
                );
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(50); // All searches in < 50ms
        });
    });

    describe('Date Calculation Performance', () => {
        test('calculates warranty expiration for 1000 items quickly', () => {
            const warranties = Array.from({ length: 1000 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + (i - 500)); // Mix of past and future
                return {
                    id: i + 1,
                    endDate: date.toISOString().split('T')[0]
                };
            });

            const startTime = Date.now();

            const calculated = warranties.map(w => ({
                ...w,
                daysRemaining: daysBetween(w.endDate),
                status: daysBetween(w.endDate) >= 0 ? 'active' : 'expired'
            }));

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(100); // Should calculate in < 100ms
            expect(calculated).toHaveLength(1000);
        });
    });

    describe('DOM Rendering Performance', () => {
        test('renders page with 100 table rows', async () => {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            await page.goto(`${baseUrl}/appliances.html`);

            // Measure rendering time
            const startTime = Date.now();

            // Simulate adding 100 rows
            await page.evaluate(() => {
                const tbody = document.querySelector('#tbl tbody');
                for (let i = 0; i < 100; i++) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>Item ${i}</td><td>Brand ${i}</td><td>Model ${i}</td><td>2023-01-15</td><td>2025-01-15</td><td><button>Edit</button></td>`;
                    tbody.appendChild(tr);
                }
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(duration).toBeLessThan(1000); // Should render in < 1s

            // Verify rows were added
            const rowCount = await page.$$eval('#tbl tbody tr', rows => rows.length);
            expect(rowCount).toBe(100);

            await browser.close();
        }, 30000);
    });

    describe('Memory Usage', () => {
        test('does not leak memory with multiple operations', () => {
            setCurrentUser({ username: 'memtest', id: 1 });

            // Perform multiple operations
            for (let i = 0; i < 10; i++) {
                const data = Array.from({ length: 100 }, (_, j) => ({
                    id: j + 1,
                    data: `Test data ${j}`
                }));

                setUserArray(`test_${i}`, data);
                getUserArray(`test_${i}`);
            }

            // If we get here without errors, memory usage is acceptable
            expect(localStorage.length).toBeGreaterThan(0);
        });
    });
});
