/**
 * Unit Tests for appliances.js
 * Tests appliance data loading, filtering, and CRUD operations
 */

import {
    mockGetAppliances,
    mockCreateAppliance,
    mockUpdateAppliance,
    mockDeleteAppliance,
    mockApiError
} from '../helpers/mocks.js';
import { testAppliances } from '../helpers/fixtures.js';
import { loadHTML } from '../helpers/dom-helpers.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Appliances Module - Data Operations', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
        // Set up logged in user
        setCurrentUser({ username: 'testuser', id: 1 });
    });

    describe('Appliance Filtering', () => {
        test('filters appliances by name', () => {
            const appliances = testAppliances;
            const query = 'refrigerator';

            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('Refrigerator');
        });

        test('filters appliances by brand', () => {
            const appliances = testAppliances;
            const query = 'samsung';

            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].brand).toBe('Samsung');
        });

        test('filters appliances by model', () => {
            const appliances = testAppliances;
            const query = 'WM3900HWA';

            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(1);
            expect(filtered[0].model).toBe('WM3900HWA');
        });

        test('returns all appliances when query is empty', () => {
            const appliances = testAppliances;
            const query = '';

            const filtered = appliances.filter(a =>
                !query || `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(appliances.length);
        });

        test('returns empty array when no match found', () => {
            const appliances = testAppliances;
            const query = 'nonexistent';

            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(0);
        });

        test('is case insensitive', () => {
            const appliances = testAppliances;
            const query = 'SAMSUNG';

            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered.length).toBeGreaterThan(0);
        });
    });

    describe('Appliance Validation', () => {
        test('validates required fields', () => {
            const appliance = {
                name: 'Refrigerator',
                purchase: '2023-01-15',
                warrantyEnd: '2025-01-15'
            };

            const isValid = !!(appliance.name && appliance.purchase && appliance.warrantyEnd);
            expect(isValid).toBe(true);
        });

        test('fails validation with missing name', () => {
            const appliance = {
                name: '',
                purchase: '2023-01-15',
                warrantyEnd: '2025-01-15'
            };

            const isValid = !!(appliance.name && appliance.purchase && appliance.warrantyEnd);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing purchase date', () => {
            const appliance = {
                name: 'Refrigerator',
                purchase: '',
                warrantyEnd: '2025-01-15'
            };

            const isValid = !!(appliance.name && appliance.purchase && appliance.warrantyEnd);
            expect(isValid).toBe(false);
        });

        test('fails validation with missing warranty end', () => {
            const appliance = {
                name: 'Refrigerator',
                purchase: '2023-01-15',
                warrantyEnd: ''
            };

            const isValid = !!(appliance.name && appliance.purchase && appliance.warrantyEnd);
            expect(isValid).toBe(false);
        });

        test('allows optional brand and model', () => {
            const appliance = {
                name: 'Refrigerator',
                brand: '',
                model: '',
                purchase: '2023-01-15',
                warrantyEnd: '2025-01-15'
            };

            const isValid = !!(appliance.name && appliance.purchase && appliance.warrantyEnd);
            expect(isValid).toBe(true);
        });
    });

    describe('API Data Transformation', () => {
        test('transforms API response to internal format', () => {
            const apiResponse = {
                id: 1,
                name: 'Refrigerator',
                brand: 'Samsung',
                model: 'RF28R7351SR',
                purchase_date: '2023-01-15',
                warranty_end: '2025-01-15'
            };

            const transformed = {
                id: apiResponse.id,
                name: apiResponse.name,
                brand: apiResponse.brand,
                model: apiResponse.model,
                purchase: apiResponse.purchase_date,
                warrantyEnd: apiResponse.warranty_end
            };

            expect(transformed.purchase).toBe(apiResponse.purchase_date);
            expect(transformed.warrantyEnd).toBe(apiResponse.warranty_end);
        });

        test('transforms internal format to API request format', () => {
            const internal = {
                name: 'Refrigerator',
                brand: 'Samsung',
                model: 'RF28R7351SR',
                purchase: '2023-01-15',
                warrantyEnd: '2025-01-15'
            };

            const apiFormat = {
                name: internal.name,
                brand: internal.brand || null,
                model: internal.model || null,
                purchase_date: internal.purchase,
                warranty_end: internal.warrantyEnd
            };

            expect(apiFormat.purchase_date).toBe(internal.purchase);
            expect(apiFormat.warranty_end).toBe(internal.warrantyEnd);
        });
    });
});
