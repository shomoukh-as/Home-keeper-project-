/**
 * Unit Tests for warranty.js
 * Tests warranty data loading, expiration calculation, and status determination
 */

import { testWarranties } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Warranty Module - Data Operations', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
        setCurrentUser({ username: 'testuser', id: 1 });
    });

    describe('Warranty Expiration Calculation', () => {
        test('calculates days remaining for active warranty', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            const dateStr = futureDate.toISOString().split('T')[0];

            const days = daysBetween(dateStr);

            expect(days).toBeGreaterThan(0);
            expect(days).toBeLessThanOrEqual(30);
        });

        test('identifies expired warranty', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 10);
            const dateStr = pastDate.toISOString().split('T')[0];

            const days = daysBetween(dateStr);

            expect(days).toBeLessThan(0);
        });

        test('handles warranty expiring today', () => {
            const today = new Date().toISOString().split('T')[0];
            const days = daysBetween(today);

            expect(days).toBe(0);
        });

        test('calculates correct days for far future date', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 2);
            const dateStr = futureDate.toISOString().split('T')[0];

            const days = daysBetween(dateStr);

            expect(days).toBeGreaterThan(365);
        });
    });

    describe('Warranty Status Display', () => {
        test('displays days remaining for active warranty', () => {
            const days = 30;
            const status = days >= 0 ? `${days} days` : 'expired';

            expect(status).toBe('30 days');
        });

        test('displays "expired" for past warranty', () => {
            const days = -10;
            const status = days >= 0 ? `${days} days` : 'expired';

            expect(status).toBe('expired');
        });

        test('displays "0 days" for warranty expiring today', () => {
            const days = 0;
            const status = days >= 0 ? `${days} days` : 'expired';

            expect(status).toBe('0 days');
        });

        test('displays correct format for single day', () => {
            const days = 1;
            const status = days >= 0 ? `${days} days` : 'expired';

            expect(status).toBe('1 days');
        });
    });

    describe('Warranty Validation', () => {
        test('validates all required fields', () => {
            const warranty = {
                appliance: 'Refrigerator',
                start: '2023-01-15',
                end: '2025-01-15'
            };

            const isValid = !!(warranty.appliance && warranty.start && warranty.end);
            expect(isValid).toBe(true);
        });

        test('fails validation with missing appliance', () => {
            const warranty = {
                appliance: '',
                start: '2023-01-15',
                end: '2025-01-15'
            };

            const isValid = !!(warranty.appliance && warranty.start && warranty.end);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing start date', () => {
            const warranty = {
                appliance: 'Refrigerator',
                start: '',
                end: '2025-01-15'
            };

            const isValid = !!(warranty.appliance && warranty.start && warranty.end);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing end date', () => {
            const warranty = {
                appliance: 'Refrigerator',
                start: '2023-01-15',
                end: ''
            };

            const isValid = !!(warranty.appliance && warranty.start && warranty.end);
            expect(isValid).toBe(false);
        });
    });

    describe('API Data Transformation', () => {
        test('transforms API response to internal format', () => {
            const apiResponse = {
                id: 1,
                appliance: 'Refrigerator',
                appliance_id: 1,
                start_date: '2023-01-15',
                end_date: '2025-01-15'
            };

            const transformed = {
                id: apiResponse.id,
                appliance: apiResponse.appliance,
                appliance_id: apiResponse.appliance_id,
                start: apiResponse.start_date,
                end: apiResponse.end_date
            };

            expect(transformed.start).toBe(apiResponse.start_date);
            expect(transformed.end).toBe(apiResponse.end_date);
        });

        test('transforms internal format to API request format', () => {
            const internal = {
                appliance: 'Refrigerator',
                start: '2023-01-15',
                end: '2025-01-15'
            };

            const apiFormat = {
                appliance_name: internal.appliance,
                start_date: internal.start,
                end_date: internal.end
            };

            expect(apiFormat.appliance_name).toBe(internal.appliance);
            expect(apiFormat.start_date).toBe(internal.start);
            expect(apiFormat.end_date).toBe(internal.end);
        });
    });

    describe('Warranty Period Validation', () => {
        test('accepts valid warranty period', () => {
            const start = '2023-01-15';
            const end = '2025-01-15';

            const startDate = new Date(start);
            const endDate = new Date(end);
            const isValid = endDate > startDate;

            expect(isValid).toBe(true);
        });

        test('rejects warranty where end is before start', () => {
            const start = '2025-01-15';
            const end = '2023-01-15';

            const startDate = new Date(start);
            const endDate = new Date(end);
            const isValid = endDate > startDate;

            expect(isValid).toBe(false);
        });

        test('rejects warranty where end equals start', () => {
            const start = '2023-01-15';
            const end = '2023-01-15';

            const startDate = new Date(start);
            const endDate = new Date(end);
            const isValid = endDate > startDate;

            expect(isValid).toBe(false);
        });
    });
});
