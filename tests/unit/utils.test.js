/**
 * Unit Tests for utils.js
 * Tests localStorage helpers, date helpers, and API request functions
 */

import {
    mockApiSuccess,
    mockApiError,
    mockNetworkError
} from '../helpers/mocks.js';

// Load the utils.js file
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
eval(utilsCode);

describe('Utils Module - localStorage Helpers', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('User Management', () => {
        test('getAllUsers returns empty array when no users exist', () => {
            expect(getAllUsers()).toEqual([]);
        });

        test('saveAllUsers stores users in localStorage', () => {
            const users = [{ username: 'test1' }, { username: 'test2' }];
            saveAllUsers(users);
            expect(localStorage.getItem('hk_users')).toBe(JSON.stringify(users));
        });

        test('getAllUsers retrieves stored users', () => {
            const users = [{ username: 'test1' }, { username: 'test2' }];
            saveAllUsers(users);
            expect(getAllUsers()).toEqual(users);
        });

        test('setCurrentUser stores current user', () => {
            const user = { username: 'testuser', id: 1 };
            setCurrentUser(user);
            expect(localStorage.getItem('hk_currentUser')).toBe(JSON.stringify(user));
        });

        test('getCurrentUser retrieves current user', () => {
            const user = { username: 'testuser', id: 1 };
            setCurrentUser(user);
            expect(getCurrentUser()).toEqual(user);
        });

        test('getCurrentUser returns null when no user is set', () => {
            expect(getCurrentUser()).toBeNull();
        });

        test('clearCurrentUser removes current user from localStorage', () => {
            const user = { username: 'testuser', id: 1 };
            setCurrentUser(user);
            clearCurrentUser();
            expect(localStorage.getItem('hk_currentUser')).toBeNull();
        });
    });

    describe('Per-User Storage', () => {
        beforeEach(() => {
            setCurrentUser({ username: 'testuser', id: 1 });
        });

        test('userKey returns null when no user is logged in', () => {
            clearCurrentUser();
            expect(userKey('appliances')).toBeNull();
        });

        test('userKey returns correct key format', () => {
            expect(userKey('appliances')).toBe('testuser__appliances');
        });

        test('getUserArray returns empty array when no data exists', () => {
            expect(getUserArray('appliances')).toEqual([]);
        });

        test('setUserArray stores array for current user', () => {
            const data = [{ name: 'test' }];
            setUserArray('appliances', data);
            expect(localStorage.getItem('testuser__appliances')).toBe(JSON.stringify(data));
        });

        test('getUserArray retrieves stored array', () => {
            const data = [{ name: 'test' }];
            setUserArray('appliances', data);
            expect(getUserArray('appliances')).toEqual(data);
        });

        test('setUserArray does nothing when no user is logged in', () => {
            clearCurrentUser();
            setUserArray('appliances', [{ name: 'test' }]);
            expect(localStorage.getItem('null__appliances')).toBeNull();
        });
    });

    describe('Token Management', () => {
        test('setAuthToken stores token in localStorage', () => {
            setAuthToken('test-token-123');
            expect(localStorage.getItem('hk_token')).toBe('test-token-123');
        });

        test('getAuthToken retrieves stored token', () => {
            setAuthToken('test-token-123');
            expect(getAuthToken()).toBe('test-token-123');
        });

        test('getAuthToken returns null when no token exists', () => {
            expect(getAuthToken()).toBeNull();
        });

        test('clearAuthToken removes token from localStorage', () => {
            setAuthToken('test-token-123');
            clearAuthToken();
            expect(localStorage.getItem('hk_token')).toBeNull();
        });
    });
});

describe('Utils Module - Date Helpers', () => {
    describe('daysBetween', () => {
        test('calculates positive days for future date', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 10);
            const dateStr = futureDate.toISOString().split('T')[0];
            expect(daysBetween(dateStr)).toBe(10);
        });

        test('calculates negative days for past date', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 5);
            const dateStr = pastDate.toISOString().split('T')[0];
            expect(daysBetween(dateStr)).toBeLessThan(0);
        });

        test('returns 0 for today', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(daysBetween(today)).toBe(0);
        });
    });

    describe('fmt', () => {
        test('formats valid date string', () => {
            const dateStr = '2023-01-15';
            const result = fmt(dateStr);
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });

        test('returns empty string for empty input', () => {
            expect(fmt('')).toBe('');
        });

        test('returns empty string for null input', () => {
            expect(fmt(null)).toBe('');
        });

        test('returns empty string for undefined input', () => {
            expect(fmt(undefined)).toBe('');
        });
    });
});

describe('Utils Module - API Helpers', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('apiRequest', () => {
        test('makes GET request successfully', async () => {
            const mockData = { items: [] };
            fetch.mockResolvedValueOnce(mockApiSuccess(mockData));

            const result = await apiRequest('/test', 'GET');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/test',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
            expect(result.data).toEqual(mockData);
        });

        test('makes POST request with data', async () => {
            const postData = { name: 'Test' };
            fetch.mockResolvedValueOnce(mockApiSuccess(postData));

            await apiRequest('/test', 'POST', postData);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/test',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(postData)
                })
            );
        });

        test('includes auth token in headers when available', async () => {
            setAuthToken('test-token');
            fetch.mockResolvedValueOnce(mockApiSuccess({}));

            await apiRequest('/test', 'GET');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/test',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token'
                    })
                })
            );
        });

        test('throws error on failed API response', async () => {
            fetch.mockResolvedValueOnce(mockApiError('Test error'));

            await expect(apiRequest('/test', 'GET')).rejects.toThrow('Test error');
        });

        test('throws error on network failure', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(apiRequest('/test', 'GET')).rejects.toThrow('Network error');
        });
    });
});
