/**
 * Feature Tests for Warranty Tracking Workflow
 * Tests complete CRUD workflows for warranties and expiration tracking
 */

import {
    mockGetWarranties,
    mockCreateWarranty,
    mockUpdateWarranty,
    mockDeleteWarranty,
    mockGetAppliances
} from '../helpers/mocks.js';
import { testWarranties, testAppliances, testUsers } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Feature: Warranty Tracking Workflow', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();

        const user = testUsers[0];
        setCurrentUser({ username: user.username, id: user.id });
        setAuthToken('test-token');
    });

    describe('Add New Warranty Workflow', () => {
        test('complete add warranty workflow with appliance link', async () => {
            // Step 1: Load appliances for dropdown
            fetch.mockResolvedValueOnce(mockGetAppliances());
            const appliancesResult = await apiRequest('/appliances', 'GET');
            expect(appliancesResult.success).toBe(true);

            // Step 2: Create warranty
            const newWarranty = {
                appliance_name: 'Refrigerator',
                start_date: '2023-12-01',
                end_date: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateWarranty(newWarranty));
            const result = await apiRequest('/warranties', 'POST', newWarranty);

            // Step 3: Verify success
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(newWarranty);
        });

        test('validates all required warranty fields', async () => {
            const invalidWarranty = {
                appliance_name: '',
                start_date: '2023-12-01',
                end_date: '2025-12-01'
            };

            const isValid = !!(
                invalidWarranty.appliance_name &&
                invalidWarranty.start_date &&
                invalidWarranty.end_date
            );

            expect(isValid).toBe(false);
        });

        test('validates end date is after start date', async () => {
            const warranty = {
                appliance_name: 'Refrigerator',
                start_date: '2025-12-01',
                end_date: '2023-12-01'
            };

            const startDate = new Date(warranty.start_date);
            const endDate = new Date(warranty.end_date);
            const isValid = endDate > startDate;

            expect(isValid).toBe(false);
        });
    });

    describe('View Warranties Workflow', () => {
        test('loads all warranties with expiration calculation', async () => {
            fetch.mockResolvedValueOnce(mockGetWarranties());

            const result = await apiRequest('/warranties', 'GET');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(testWarranties.length);

            result.data.forEach(warranty => {
                expect(warranty).toMatchObject({
                    appliance: expect.any(String),
                    start_date: expect.any(String),
                    end_date: expect.any(String)
                });

                // Calculate expiration
                const days = daysBetween(warranty.end_date);
                expect(typeof days).toBe('number');
            });
        });

        test('correctly identifies active warranties', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            const activeWarranty = {
                id: 1,
                appliance: 'Test Appliance',
                appliance_id: 1,
                start_date: '2023-01-01',
                end_date: futureDate.toISOString().split('T')[0]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [activeWarranty] })
            });

            const result = await apiRequest('/warranties', 'GET');
            const warranty = result.data[0];
            const days = daysBetween(warranty.end_date);

            expect(days).toBeGreaterThan(0);
            const status = days >= 0 ? `${days} days` : 'expired';
            expect(status).not.toBe('expired');
        });

        test('correctly identifies expired warranties', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 30);

            const expiredWarranty = {
                id: 1,
                appliance: 'Test Appliance',
                appliance_id: 1,
                start_date: '2020-01-01',
                end_date: pastDate.toISOString().split('T')[0]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [expiredWarranty] })
            });

            const result = await apiRequest('/warranties', 'GET');
            const warranty = result.data[0];
            const days = daysBetween(warranty.end_date);

            expect(days).toBeLessThan(0);
            const status = days >= 0 ? `${days} days` : 'expired';
            expect(status).toBe('expired');
        });
    });

    describe('Warranty Expiration Tracking', () => {
        test('calculates days remaining correctly', () => {
            const today = new Date();

            // 10 days from now
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + 10);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            const daysRemaining = daysBetween(futureDateStr);
            expect(daysRemaining).toBe(10);
        });

        test('handles warranty expiring today', () => {
            const today = new Date().toISOString().split('T')[0];
            const days = daysBetween(today);

            expect(days).toBe(0);
            const status = days >= 0 ? `${days} days` : 'expired';
            expect(status).toBe('0 days');
        });

        test('displays expired status for past warranties', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 5);
            const pastDateStr = pastDate.toISOString().split('T')[0];

            const days = daysBetween(pastDateStr);
            expect(days).toBeLessThan(0);

            const status = days >= 0 ? `${days} days` : 'expired';
            expect(status).toBe('expired');
        });

        test('calculates long-term warranties correctly', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 2);
            const futureDateStr = futureDate.toISOString().split('T')[0];

            const days = daysBetween(futureDateStr);
            expect(days).toBeGreaterThan(365);
        });
    });

    describe('Edit Warranty Workflow', () => {
        test('complete edit warranty workflow succeeds', async () => {
            const warrantyId = 1;
            const updates = {
                appliance_name: 'Refrigerator',
                start_date: '2023-01-15',
                end_date: '2026-01-15' // Extended warranty
            };

            fetch.mockResolvedValueOnce(mockUpdateWarranty({ id: warrantyId, ...updates }));

            const result = await apiRequest(`/warranties/${warrantyId}`, 'PUT', updates);

            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(updates);
        });

        test('can extend warranty end date', async () => {
            const warrantyId = 1;
            const originalEnd = '2025-01-15';
            const extendedEnd = '2026-01-15';

            const updates = {
                appliance_name: 'Refrigerator',
                start_date: '2023-01-15',
                end_date: extendedEnd
            };

            fetch.mockResolvedValueOnce(mockUpdateWarranty({ id: warrantyId, ...updates }));

            const result = await apiRequest(`/warranties/${warrantyId}`, 'PUT', updates);

            expect(result.success).toBe(true);
            expect(result.data.end_date).toBe(extendedEnd);
        });
    });

    describe('Delete Warranty Workflow', () => {
        test('complete delete warranty workflow succeeds', async () => {
            const warrantyId = 1;

            fetch.mockResolvedValueOnce(mockDeleteWarranty());

            const result = await apiRequest(`/warranties/${warrantyId}`, 'DELETE');

            expect(result.success).toBe(true);
        });
    });

    describe('Warranty-Appliance Relationship', () => {
        test('warranty links to existing appliance', async () => {
            // Load appliances
            fetch.mockResolvedValueOnce(mockGetAppliances());
            const appliancesResult = await apiRequest('/appliances', 'GET');
            const appliances = appliancesResult.data;

            // Create warranty for first appliance
            const newWarranty = {
                appliance_name: appliances[0].name,
                start_date: '2023-12-01',
                end_date: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateWarranty(newWarranty));
            const result = await apiRequest('/warranties', 'POST', newWarranty);

            expect(result.success).toBe(true);
            expect(result.data.appliance_name).toBe(appliances[0].name);
        });

        test('appliance can have multiple warranty records', async () => {
            const applianceName = 'Refrigerator';

            // Create extended warranty
            const extendedWarranty = {
                appliance_name: applianceName,
                start_date: '2025-01-15',
                end_date: '2027-01-15'
            };

            fetch.mockResolvedValueOnce(mockCreateWarranty(extendedWarranty));
            const result = await apiRequest('/warranties', 'POST', extendedWarranty);

            expect(result.success).toBe(true);
        });
    });

    describe('Warranty Alert Scenarios', () => {
        test('identifies warranties expiring soon (within 30 days)', () => {
            const today = new Date();
            const soonDate = new Date(today);
            soonDate.setDate(soonDate.getDate() + 15); // 15 days from now

            const days = daysBetween(soonDate.toISOString().split('T')[0]);

            expect(days).toBeLessThanOrEqual(30);
            expect(days).toBeGreaterThan(0);

            const isExpiringSoon = days > 0 && days <= 30;
            expect(isExpiringSoon).toBe(true);
        });

        test('does not alert for long-term warranties', () => {
            const today = new Date();
            const farDate = new Date(today);
            farDate.setDate(farDate.getDate() + 365); // 1 year from now

            const days = daysBetween(farDate.toISOString().split('T')[0]);

            const isExpiringSoon = days > 0 && days <= 30;
            expect(isExpiringSoon).toBe(false);
        });
    });
});
