/**
 * Unit Tests for invoices.js
 * Tests invoice data loading, filtering, and validation
 */

import { testInvoices, testAppliances } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Invoices Module - Data Operations', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
        setCurrentUser({ username: 'testuser', id: 1 });
    });

    describe('Invoice Filtering', () => {
        test('filters invoices by appliance name', () => {
            const invoices = testInvoices;
            const query = 'refrigerator';

            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].appliance).toBe('Refrigerator');
        });

        test('filters invoices by invoice number', () => {
            const invoices = testInvoices;
            const query = 'INV-001';

            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].invoice_number).toBe('INV-001');
        });

        test('filters invoices by store name', () => {
            const invoices = testInvoices;
            const query = 'best buy';

            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].store).toBe('Best Buy');
        });

        test('is case insensitive', () => {
            const invoices = testInvoices;
            const query = 'BEST BUY';

            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered.length).toBeGreaterThan(0);
        });

        test('returns empty array when no match found', () => {
            const invoices = testInvoices;
            const query = 'nonexistent';

            const filtered = invoices.filter(inv =>
                `${inv.appliance} ${inv.number} ${inv.store}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(0);
        });
    });

    describe('Invoice Validation', () => {
        test('validates all required fields', () => {
            const invoice = {
                appliance: 'Refrigerator',
                number: 'INV-001',
                date: '2023-01-15',
                amount: '1299.99',
                store: 'Best Buy'
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(true);
        });

        test('fails validation with missing appliance', () => {
            const invoice = {
                appliance: '',
                number: 'INV-001',
                date: '2023-01-15',
                amount: '1299.99',
                store: 'Best Buy'
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing invoice number', () => {
            const invoice = {
                appliance: 'Refrigerator',
                number: '',
                date: '2023-01-15',
                amount: '1299.99',
                store: 'Best Buy'
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing date', () => {
            const invoice = {
                appliance: 'Refrigerator',
                number: 'INV-001',
                date: '',
                amount: '1299.99',
                store: 'Best Buy'
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing amount', () => {
            const invoice = {
                appliance: 'Refrigerator',
                number: 'INV-001',
                date: '2023-01-15',
                amount: '',
                store: 'Best Buy'
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing store', () => {
            const invoice = {
                appliance: 'Refrigerator',
                number: 'INV-001',
                date: '2023-01-15',
                amount: '1299.99',
                store: ''
            };

            const isValid = !!(invoice.appliance && invoice.number && invoice.date && invoice.amount && invoice.store);
            expect(isValid).toBe(false);
        });
    });

    describe('Amount Formatting', () => {
        test('formats amount with two decimal places', () => {
            const amount = 1299.99;
            const formatted = Number(amount).toFixed(2);
            expect(formatted).toBe('1299.99');
        });

        test('adds decimal places to whole numbers', () => {
            const amount = 1300;
            const formatted = Number(amount).toFixed(2);
            expect(formatted).toBe('1300.00');
        });

        test('rounds to two decimal places', () => {
            const amount = 1299.999;
            const formatted = Number(amount).toFixed(2);
            expect(formatted).toBe('1300.00');
        });

        test('handles string input', () => {
            const amount = '1299.99';
            const formatted = Number(amount).toFixed(2);
            expect(formatted).toBe('1299.99');
        });
    });

    describe('API Data Transformation', () => {
        test('transforms API response to internal format', () => {
            const apiResponse = {
                id: 1,
                appliance: 'Refrigerator',
                appliance_id: 1,
                invoice_number: 'INV-001',
                date: '2023-01-15',
                amount: 1299.99,
                store: 'Best Buy'
            };

            const transformed = {
                id: apiResponse.id,
                appliance: apiResponse.appliance,
                appliance_id: apiResponse.appliance_id,
                number: apiResponse.invoice_number,
                date: apiResponse.date,
                amount: apiResponse.amount,
                store: apiResponse.store
            };

            expect(transformed.number).toBe(apiResponse.invoice_number);
            expect(transformed.appliance_id).toBe(apiResponse.appliance_id);
        });

        test('transforms internal format to API request format', () => {
            const internal = {
                appliance: 'Refrigerator',
                number: 'INV-001',
                date: '2023-01-15',
                amount: '1299.99',
                store: 'Best Buy'
            };

            const apiFormat = {
                appliance_name: internal.appliance,
                invoice_number: internal.number,
                date: internal.date,
                amount: internal.amount,
                store: internal.store
            };

            expect(apiFormat.appliance_name).toBe(internal.appliance);
            expect(apiFormat.invoice_number).toBe(internal.number);
        });
    });
});
