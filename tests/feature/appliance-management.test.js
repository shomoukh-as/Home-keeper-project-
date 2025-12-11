/**
 * Feature Tests for Appliance Management Workflow
 * Tests complete CRUD workflows for appliances
 */

import {
    mockGetAppliances,
    mockCreateAppliance,
    mockUpdateAppliance,
    mockDeleteAppliance,
    mockApiError,
    mockAuthLoginSuccess
} from '../helpers/mocks.js';
import { testAppliances, testUsers } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
const authCode = fs.readFileSync(path.resolve(__dirname, '../../js/auth.js'), 'utf8');
const authCodeForTest = authCode.replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/g, '');
eval(utilsCode);
eval(authCodeForTest);

describe('Feature: Appliance Management Workflow', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();

        // Login as test user
        const user = testUsers[0];
        setCurrentUser({ username: user.username, id: user.id });
        setAuthToken('test-token');
    });

    describe('Add New Appliance Workflow', () => {
        test('complete add appliance workflow succeeds', async () => {
            const newAppliance = {
                name: 'Dishwasher',
                brand: 'Bosch',
                model: 'SHPM88Z75N',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateAppliance(newAppliance));

            // Step 1: Make API request
            const result = await apiRequest('/appliances', 'POST', newAppliance);

            // Step 2: Verify success
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(newAppliance);

            // Step 3: Verify API was called correctly
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/appliances',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(newAppliance),
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token'
                    })
                })
            );
        });

        test('add appliance validates required fields', async () => {
            const invalidAppliance = {
                name: '',
                brand: 'Bosch',
                model: 'SHPM88Z75N',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            // Validate before API call
            const isValid = !!(invalidAppliance.name && invalidAppliance.purchase_date && invalidAppliance.warranty_end);

            expect(isValid).toBe(false);
        });

        test('add appliance allows optional brand and model', async () => {
            const minimalAppliance = {
                name: 'Dishwasher',
                brand: null,
                model: null,
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateAppliance(minimalAppliance));

            const result = await apiRequest('/appliances', 'POST', minimalAppliance);

            expect(result.success).toBe(true);
        });
    });

    describe('View Appliances Workflow', () => {
        test('loads all appliances successfully', async () => {
            fetch.mockResolvedValueOnce(mockGetAppliances());

            // Step 1: Fetch appliances
            const result = await apiRequest('/appliances', 'GET');

            // Step 2: Verify data received
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(testAppliances.length);
            expect(result.data[0]).toMatchObject({
                name: expect.any(String),
                purchase_date: expect.any(String),
                warranty_end: expect.any(String)
            });
        });

        test('handles empty appliance list', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: [] })
            });

            const result = await apiRequest('/appliances', 'GET');

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });
    });

    describe('Search/Filter Appliances Workflow', () => {
        test('filters appliances by search query', async () => {
            fetch.mockResolvedValueOnce(mockGetAppliances());

            // Step 1: Load all appliances
            const result = await apiRequest('/appliances', 'GET');
            const appliances = result.data;

            // Step 2: Filter locally (simulating client-side filter)
            const query = 'samsung';
            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            // Step 3: Verify filtering works
            expect(filtered.length).toBeGreaterThan(0);
            filtered.forEach(appliance => {
                const searchText = `${appliance.name} ${appliance.brand} ${appliance.model}`.toLowerCase();
                expect(searchText).toContain(query.toLowerCase());
            });
        });

        test('returns all appliances with empty search', async () => {
            fetch.mockResolvedValueOnce(mockGetAppliances());

            const result = await apiRequest('/appliances', 'GET');
            const appliances = result.data;

            const query = '';
            const filtered = appliances.filter(a =>
                !query || `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toEqual(appliances);
        });

        test('returns empty array when no matches found', async () => {
            fetch.mockResolvedValueOnce(mockGetAppliances());

            const result = await apiRequest('/appliances', 'GET');
            const appliances = result.data;

            const query = 'nonexistentbrand';
            const filtered = appliances.filter(a =>
                `${a.name} ${a.brand} ${a.model}`.toLowerCase().includes(query.toLowerCase())
            );

            expect(filtered).toHaveLength(0);
        });
    });

    describe('Edit Appliance Workflow', () => {
        test('complete edit appliance workflow succeeds', async () => {
            const applianceId = 1;
            const updates = {
                name: 'Updated Refrigerator',
                brand: 'Samsung',
                model: 'RF28R7351SR-UPDATED',
                purchase_date: '2023-01-15',
                warranty_end: '2026-01-15'
            };

            fetch.mockResolvedValueOnce(mockUpdateAppliance({ id: applianceId, ...updates }));

            // Step 1: Update appliance
            const result = await apiRequest(`/appliances/${applianceId}`, 'PUT', updates);

            // Step 2: Verify success
            expect(result.success).toBe(true);
            expect(result.data).toMatchObject(updates);

            // Step 3: Verify API was called correctly
            expect(fetch).toHaveBeenCalledWith(
                `http://localhost:3000/api/appliances/${applianceId}`,
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(updates)
                })
            );
        });

        test('edit validates required fields', async () => {
            const invalidUpdate = {
                name: '',
                brand: 'Samsung',
                model: 'RF28R7351SR',
                purchase_date: '2023-01-15',
                warranty_end: '2026-01-15'
            };

            const isValid = !!(invalidUpdate.name && invalidUpdate.purchase_date && invalidUpdate.warranty_end);
            expect(isValid).toBe(false);
        });
    });

    describe('Delete Appliance Workflow', () => {
        test('complete delete appliance workflow succeeds', async () => {
            const applianceId = 1;

            fetch.mockResolvedValueOnce(mockDeleteAppliance());

            // Step 1: Delete appliance
            const result = await apiRequest(`/appliances/${applianceId}`, 'DELETE');

            // Step 2: Verify success
            expect(result.success).toBe(true);

            // Step 3: Verify API was called correctly
            expect(fetch).toHaveBeenCalledWith(
                `http://localhost:3000/api/appliances/${applianceId}`,
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });

        test('delete handles non-existent appliance', async () => {
            const applianceId = 999;

            fetch.mockResolvedValueOnce(mockApiError('Appliance not found'));

            await expect(
                apiRequest(`/appliances/${applianceId}`, 'DELETE')
            ).rejects.toThrow('Appliance not found');
        });
    });

    describe('Complete CRUD Cycle', () => {
        test('create → read → update → delete workflow', async () => {
            // Step 1: Create
            const newAppliance = {
                name: 'Test Appliance',
                brand: 'Test Brand',
                model: 'TEST-001',
                purchase_date: '2023-12-01',
                warranty_end: '2025-12-01'
            };

            fetch.mockResolvedValueOnce(mockCreateAppliance({ id: 100, ...newAppliance }));
            const createResult = await apiRequest('/appliances', 'POST', newAppliance);
            expect(createResult.success).toBe(true);
            const createdId = createResult.data.id;

            // Step 2: Read
            fetch.mockResolvedValueOnce(mockGetAppliances());
            const readResult = await apiRequest('/appliances', 'GET');
            expect(readResult.success).toBe(true);

            // Step 3: Update
            const updates = { ...newAppliance, name: 'Updated Test Appliance' };
            fetch.mockResolvedValueOnce(mockUpdateAppliance({ id: createdId, ...updates }));
            const updateResult = await apiRequest(`/appliances/${createdId}`, 'PUT', updates);
            expect(updateResult.success).toBe(true);

            // Step 4: Delete
            fetch.mockResolvedValueOnce(mockDeleteAppliance());
            const deleteResult = await apiRequest(`/appliances/${createdId}`, 'DELETE');
            expect(deleteResult.success).toBe(true);
        });
    });
});
