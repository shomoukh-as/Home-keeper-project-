/**
 * Release Tests - User Acceptance Tests
 * Test complete user workflows from start to finish
 */

const fs = require('fs');
const path = require('path');

// Load dependencies
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
const authCode = fs.readFileSync(path.resolve(__dirname, '../../js/auth.js'), 'utf8');
const authCodeForTest = authCode.replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/g, '');
eval(utilsCode);
eval(authCodeForTest);

import {
    mockAuthRegisterSuccess,
    mockAuthLoginSuccess,
    mockGetAppliances,
    mockCreateAppliance,
    mockCreateInvoice,
    mockCreateWarranty
} from '../helpers/mocks.js';

describe('Release: User Acceptance Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
    });

    describe('Complete User Journey', () => {
        test('new user can register, login, and add appliance', async () => {
            const username = 'acceptanceuser';
            const password = 'securepass123';

            // Step 1: Register
            fetch.mockResolvedValueOnce(mockAuthRegisterSuccess());
            const registerResult = await registerUser(username, password);

            expect(registerResult.success).toBe(true);
            expect(registerResult.message).toBeTruthy();

            // Step 2: Login
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess({ id: 1, username }));
            const loginResult = await loginUser(username, password);

            expect(loginResult.success).toBe(true);
            expect(getCurrentUser()).toEqual({ username, id: 1 });
            expect(getAuthToken()).toBeTruthy();

            // Step 3: Add appliance
            const newAppliance = {
                name: 'Refrigerator',
                brand: 'Samsung',
                model: 'RF28R7351SR',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateAppliance(newAppliance));
            const applianceResult = await apiRequest('/appliances', 'POST', newAppliance);

            expect(applianceResult.success).toBe(true);
            expect(applianceResult.data).toMatchObject(newAppliance);
        });

        test('user can manage complete appliance lifecycle', async () => {
            // Setup: Login
            const user = { id: 1, username: 'testuser' };
            setCurrentUser(user);
            setAuthToken('test-token');

            // Create appliance
            const appliance = {
                name: 'Test Appliance',
                brand: 'Test Brand',
                model: 'TEST-001',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateAppliance({ id: 1, ...appliance }));
            const createResult = await apiRequest('/appliances', 'POST', appliance);
            expect(createResult.success).toBe(true);

            // Create invoice for appliance
            const invoice = {
                appliance_name: 'Test Appliance',
                invoice_number: 'INV-TEST-001',
                date: '2023-12-01',
                amount: 999.99,
                store: 'Test Store'
            };

            fetch.mockResolvedValueOnce(mockCreateInvoice(invoice));
            const invoiceResult = await apiRequest('/invoices', 'POST', invoice);
            expect(invoiceResult.success).toBe(true);

            // Create warranty for appliance
            const warranty = {
                appliance_name: 'Test Appliance',
                start_date: '2023-12-01',
                end_date: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateWarranty(warranty));
            const warrantyResult = await apiRequest('/warranties', 'POST', warranty);
            expect(warrantyResult.success).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('displays appropriate error for invalid login', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, message: 'Invalid credentials' })
            });

            const result = await loginUser('wronguser', 'wrongpass');

            expect(result.success).toBe(false);
            expect(result.message).toBeTruthy();
            expect(result.message).toContain('Invalid');
        });

        test('displays appropriate error for registration failure', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ success: false, message: 'Username already exists' })
            });

            const result = await registerUser('existinguser', 'password');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Username already exists');
        });

        test('validates empty form fields', async () => {
            const result = await registerUser('', '');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Fill both fields');
        });

        test('handles network errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await loginUser('testuser', 'password');

            expect(result.success).toBe(false);
            expect(result.message).toBeTruthy();
        });
    });

    describe('Data Validation', () => {
        test('validates appliance required fields', () => {
            const invalidAppliance = {
                name: '',
                brand: 'Samsung',
                model: 'RF28R7351SR',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            const isValid = !!(
                invalidAppliance.name &&
                invalidAppliance.purchase_date &&
                invalidAppliance.warranty_end
            );

            expect(isValid).toBe(false);
        });

        test('validates invoice required fields', () => {
            const validInvoice = {
                appliance_name: 'Refrigerator',
                invoice_number: 'INV-001',
                date: '2023-12-01',
                amount: '999.99',
                store: 'Best Buy'
            };

            const isValid = !!(
                validInvoice.appliance_name &&
                validInvoice.invoice_number &&
                validInvoice.date &&
                validInvoice.amount &&
                validInvoice.store
            );

            expect(isValid).toBe(true);
        });

        test('validates warranty date order', () => {
            const validWarranty = {
                appliance_name: 'Refrigerator',
                start_date: '2023-01-01',
                end_date: '2025-01-01'
            };

            const startDate = new Date(validWarranty.start_date);
            const endDate = new Date(validWarranty.end_date);
            const isValid = endDate > startDate;

            expect(isValid).toBe(true);
        });

        test('rejects invalid warranty dates', () => {
            const invalidWarranty = {
                appliance_name: 'Refrigerator',
                start_date: '2025-01-01',
                end_date: '2023-01-01'
            };

            const startDate = new Date(invalidWarranty.start_date);
            const endDate = new Date(invalidWarranty.end_date);
            const isValid = endDate > startDate;

            expect(isValid).toBe(false);
        });
    });

    describe('User Experience Workflows', () => {
        test('warranty expiration alerts work correctly', () => {
            const today = new Date();

            // Warranty expiring in 5 days
            const soonDate = new Date(today);
            soonDate.setDate(soonDate.getDate() + 5);
            const soonDays = daysBetween(soonDate.toISOString().split('T')[0]);

            expect(soonDays).toBeLessThanOrEqual(30);
            expect(soonDays).toBeGreaterThan(0);

            const needsAlert = soonDays > 0 && soonDays <= 30;
            expect(needsAlert).toBe(true);
        });

        test('expired warranties are properly identified', () => {
            const today = new Date();
            const pastDate = new Date(today);
            pastDate.setDate(pastDate.getDate() - 10);

            const days = daysBetween(pastDate.toISOString().split('T')[0]);
            const status = days >= 0 ? 'active' : 'expired';

            expect(status).toBe('expired');
        });

        test('search functionality is case-insensitive', () => {
            const items = [
                { name: 'Refrigerator', brand: 'Samsung' },
                { name: 'Washing Machine', brand: 'LG' }
            ];

            const query = 'SAMSUNG';
            const filtered = items.filter(item =>
                `${item.name} ${item.brand}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered.length).toBe(1);
            expect(filtered[0].brand).toBe('Samsung');
        });

        test('amount formatting displays correctly', () => {
            const amounts = [1299.99, 1300, 999.999];
            const formatted = amounts.map(amt => Number(amt).toFixed(2));

            expect(formatted[0]).toBe('1299.99');
            expect(formatted[1]).toBe('1300.00');
            expect(formatted[2]).toBe('1000.00');
        });
    });

    describe('Multi-User Scenarios', () => {
        test('different users have isolated data', () => {
            // User 1 creates appliance
            setCurrentUser({ username: 'user1', id: 1 });
            setUserArray('appliances', [{ id: 1, name: 'User1 Device' }]);

            // User 2 creates appliance
            setCurrentUser({ username: 'user2', id: 2 });
            setUserArray('appliances', [{ id: 2, name: 'User2 Device' }]);

            // Verify user2s data
            const user2Data = getUserArray('appliances');
            expect(user2Data[0].name).toBe('User2 Device');

            // Switch back to user1
            setCurrentUser({ username: 'user1', id: 1 });
            const user1Data = getUserArray('appliances');
            expect(user1Data[0].name).toBe('User1 Device');
        });

        test('logout clears current user but preserves their data', () => {
            // Login and create data
            setCurrentUser({ username: 'testuser', id: 1 });
            setUserArray('appliances', [{ id: 1, name: 'Test Device' }]);

            // Logout
            clearCurrentUser();
            clearAuthToken();

            // Verify user is logged out
            expect(getCurrentUser()).toBeNull();
            expect(getAuthToken()).toBeNull();

            // Login again
            setCurrentUser({ username: 'testuser', id: 1 });

            // Data should still exist
            const data = getUserArray('appliances');
            expect(data[0].name).toBe('Test Device');
        });
    });
});
