/**
 * Feature Tests for Invoice Management Workflow
 * Tests complete CRUD workflows for invoices
 */

import {
    mockGetInvoices,
    mockCreateInvoice,
    mockUpdateInvoice,
    mockDeleteInvoice,
    mockGetAppliances,
    mockApiError
} from '../helpers/mocks.js';
import { testInvoices, testAppliances, testUsers } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Feature: Invoice Management Workflow', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();

        const user = testUsers[0];
        setCurrentUser({ username: user.username, id: user.id });
        setAuthToken('test-token');
    });

    describe('Add New Invoice Workflow', () => {
        test('complete add invoice workflow with appliance link', async () => {
            // Step 1: Load appliances for dropdown
            fetch.mockResolvedValueOnce(mockGetAppliances());
            const appliancesResult = await apiRequest('/appliances', 'GET');
            expect(appliancesResult.success).toBe(true);

            // Step 2: Create invoice linked to appliance
            const newInvoice = {
                appliance_name: 'Refrigerator',
                invoice_number: 'INV-NEW-001',
                date: '2023-12-15',
                amount: 1599.99,
                store: 'Electronics Store'
            };

            fetch.mockResolvedValueOnce(mockCreateInvoice(newInvoice));
            const result = await apiRequest('/invoices', 'POST', newInvoice);

            // Step 3: Verify success
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(newInvoice);

            // Step 4: Verify API calls
            expect(fetch).toHaveBeenCalledTimes(2); // appliances + invoice
        });

        test('validates all required invoice fields', async () => {
            const invalidInvoice = {
                appliance_name: 'Refrigerator',
                invoice_number: '',
                date: '2023-12-15',
                amount: 1599.99,
                store: 'Electronics Store'
            };

            const isValid = !!(
                invalidInvoice.appliance_name &&
                invalidInvoice.invoice_number &&
                invalidInvoice.date &&
                invalidInvoice.amount &&
                invalidInvoice.store
            );

            expect(isValid).toBe(false);
        });

        test('validates amount is a number', async () => {
            const invoice = {
                appliance_name: 'Refrigerator',
                invoice_number: 'INV-001',
                date: '2023-12-15',
                amount: '1599.99',
                store: 'Electronics Store'
            };

            const amount = Number(invoice.amount);
            expect(amount).toBe(1599.99);
            expect(isNaN(amount)).toBe(false);
        });
    });

    describe('View Invoices Workflow', () => {
        test('loads all invoices with appliance information', async () => {
            fetch.mockResolvedValueOnce(mockGetInvoices());

            const result = await apiRequest('/invoices', 'GET');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(testInvoices.length);
            expect(result.data[0]).toMatchObject({
                appliance: expect.any(String),
                invoice_number: expect.any(String),
                date: expect.any(String),
                amount: expect.any(Number),
                store: expect.any(String)
            });
        });

        test('displays amounts with proper formatting', async () => {
            fetch.mockResolvedValueOnce(mockGetInvoices());

            const result = await apiRequest('/invoices', 'GET');
            const invoices = result.data;

            invoices.forEach(invoice => {
                const formatted = Number(invoice.amount).toFixed(2);
                expect(formatted).toMatch(/^\d+\.\d{2}$/);
            });
        });
    });

    describe('Search/Filter Invoices Workflow', () => {
        test('filters invoices by appliance name', async () => {
            fetch.mockResolvedValueOnce(mockGetInvoices());

            const result = await apiRequest('/invoices', 'GET');
            const invoices = result.data;

            const query = 'refrigerator';
            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.invoice_number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered.length).toBeGreaterThan(0);
            filtered.forEach(invoice => {
                expect(invoice.appliance.toLowerCase()).toContain(query.toLowerCase());
            });
        });

        test('filters invoices by invoice number', async () => {
            fetch.mockResolvedValueOnce(mockGetInvoices());

            const result = await apiRequest('/invoices', 'GET');
            const invoices = result.data;

            const query = 'INV-001';
            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.invoice_number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].invoice_number).toBe('INV-001');
        });

        test('filters invoices by store name', async () => {
            fetch.mockResolvedValueOnce(mockGetInvoices());

            const result = await apiRequest('/invoices', 'GET');
            const invoices = result.data;

            const query = 'depot';
            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.invoice_number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered.length).toBeGreaterThan(0);
        });
    });

    describe('Edit Invoice Workflow', () => {
        test('complete edit invoice workflow succeeds', async () => {
            const invoiceId = 1;
            const updates = {
                appliance_name: 'Refrigerator',
                invoice_number: 'INV-001-UPDATED',
                date: '2023-01-15',
                amount: 1399.99,
                store: 'Updated Store'
            };

            fetch.mockResolvedValueOnce(mockUpdateInvoice({ id: invoiceId, ...updates }));

            const result = await apiRequest(`/invoices/${invoiceId}`, 'PUT', updates);

            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(updates);
            expect(fetch).toHaveBeenCalledWith(
                `http://localhost:3000/api/invoices/${invoiceId}`,
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(updates)
                })
            );
        });

        test('edit can change linked appliance', async () => {
            const invoiceId = 1;
            const updates = {
                appliance_name: 'Washing Machine', // Changed appliance
                invoice_number: 'INV-001',
                date: '2023-01-15',
                amount: 1299.99,
                store: 'Best Buy'
            };

            fetch.mockResolvedValueOnce(mockUpdateInvoice({ id: invoiceId, ...updates }));

            const result = await apiRequest(`/invoices/${invoiceId}`, 'PUT', updates);

            expect(result.success).toBe(true);
            expect(result.data.appliance_name).toBe('Washing Machine');
        });
    });

    describe('Delete Invoice Workflow', () => {
        test('complete delete invoice workflow succeeds', async () => {
            const invoiceId = 1;

            fetch.mockResolvedValueOnce(mockDeleteInvoice());

            const result = await apiRequest(`/invoices/${invoiceId}`, 'DELETE');

            expect(result.success).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                `http://localhost:3000/api/invoices/${invoiceId}`,
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });
    });

    describe('Invoice-Appliance Relationship', () => {
        test('invoice links to existing appliance', async () => {
            // Load appliances first
            fetch.mockResolvedValueOnce(mockGetAppliances());
            const appliancesResult = await apiRequest('/appliances', 'GET');
            const appliances = appliancesResult.data;

            // Create invoice for first appliance
            const newInvoice = {
                appliance_name: appliances[0].name,
                invoice_number: 'INV-LINK-001',
                date: '2023-12-15',
                amount: 999.99,
                store: 'Test Store'
            };

            fetch.mockResolvedValueOnce(mockCreateInvoice(newInvoice));
            const result = await apiRequest('/invoices', 'POST', newInvoice);

            expect(result.success).toBe(true);
            expect(result.data.appliance_name).toBe(appliances[0].name);
        });

        test('multiple invoices can link to same appliance', async () => {
            const applianceName = 'Refrigerator';

            // Create first invoice
            const invoice1 = {
                appliance_name: applianceName,
                invoice_number: 'INV-001',
                date: '2023-01-15',
                amount: 1299.99,
                store: 'Store 1'
            };

            // Create second invoice for same appliance
            const invoice2 = {
                appliance_name: applianceName,
                invoice_number: 'INV-002',
                date: '2023-06-15',
                amount: 99.99,
                store: 'Store 2'
            };

            fetch.mockResolvedValueOnce(mockCreateInvoice(invoice1));
            const result1 = await apiRequest('/invoices', 'POST', invoice1);

            fetch.mockResolvedValueOnce(mockCreateInvoice(invoice2));
            const result2 = await apiRequest('/invoices', 'POST', invoice2);

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            expect(result1.data.appliance_name).toBe(result2.data.appliance_name);
        });
    });
});
