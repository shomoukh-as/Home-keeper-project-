/**
 * Unit Tests for auth.js
 * Tests user registration, login, and logout functionality
 */

import {
    mockAuthRegisterSuccess,
    mockAuthLoginSuccess,
    mockAuthLogoutSuccess,
    mockApiError
} from '../helpers/mocks.js';
import { testUsers } from '../helpers/fixtures.js';

// Load dependencies
const fs = require('fs');
const path = require('path');
const utilsCode = fs.readFileSync(path.resolve(__dirname, '../../js/utils.js'), 'utf8');
const authCode = fs.readFileSync(path.resolve(__dirname, '../../js/auth.js'), 'utf8');

// Remove DOMContentLoaded listener from auth.js for testing
const authCodeForTest = authCode.replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/g, '');
eval(utilsCode);
eval(authCodeForTest);

describe('Auth Module', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
        window.location.href = '';
    });

    describe('registerUser', () => {
        test('successfully registers user with valid credentials', async () => {
            fetch.mockResolvedValueOnce(mockAuthRegisterSuccess());

            const result = await registerUser('newuser', 'password123');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/register',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: 'newuser', password: 'password123' })
                })
            );
            expect(result.success).toBe(true);
            expect(result.message).toBeTruthy();
        });

        test('trims username whitespace', async () => {
            fetch.mockResolvedValueOnce(mockAuthRegisterSuccess());

            await registerUser('  testuser  ', 'password123');

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/register',
                expect.objectContaining({
                    body: JSON.stringify({ username: 'testuser', password: 'password123' })
                })
            );
        });

        test('fails when username is empty', async () => {
            const result = await registerUser('', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Fill both fields');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('fails when password is empty', async () => {
            const result = await registerUser('testuser', '');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Fill both fields');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('fails when username is only whitespace', async () => {
            const result = await registerUser('   ', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Fill both fields');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('handles API error response', async () => {
            fetch.mockResolvedValueOnce(mockApiError('Username already exists'));

            const result = await registerUser('existinguser', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Username already exists');
        });

        test('handles network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await registerUser('testuser', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toContain('failed');
        });
    });

    describe('loginUser', () => {
        test('successfully logs in user with valid credentials', async () => {
            const user = testUsers[0];
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));

            const result = await loginUser(user.username, user.password);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username: user.username, password: user.password })
                })
            );
            expect(result.success).toBe(true);
            expect(getAuthToken()).toBe('mock-jwt-token-123');
            expect(getCurrentUser()).toEqual({ username: user.username, id: user.id });
        });

        test('trims username whitespace', async () => {
            const user = testUsers[0];
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));

            await loginUser('  ' + user.username + '  ', user.password);

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/login',
                expect.objectContaining({
                    body: JSON.stringify({ username: user.username, password: user.password })
                })
            );
        });

        test('fails with invalid credentials', async () => {
            fetch.mockResolvedValueOnce(mockApiError('Invalid credentials'));

            const result = await loginUser('wronguser', 'wrongpass');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Invalid credentials');
            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
        });

        test('handles missing token in response', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, user: { username: 'test', id: 1 } })
            });

            const result = await loginUser('testuser', 'password');

            expect(result.success).toBe(false);
        });

        test('handles network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await loginUser('testuser', 'password');

            expect(result.success).toBe(false);
            expect(result.message).toContain('Invalid username or password');
        });
    });

    describe('logoutCurrent', () => {
        test('clears auth data and redirects to index', async () => {
            // Set up logged in state
            setAuthToken('test-token');
            setCurrentUser({ username: 'testuser', id: 1 });

            fetch.mockResolvedValueOnce(mockAuthLogoutSuccess());

            await logoutCurrent();

            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/logout',
                expect.objectContaining({ method: 'POST' })
            );
            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
            expect(window.location.href).toBe('index.html');
        });

        test('clears auth data even if API call fails', async () => {
            setAuthToken('test-token');
            setCurrentUser({ username: 'testuser', id: 1 });

            fetch.mockRejectedValueOnce(new Error('Network error'));

            await logoutCurrent();

            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
            expect(window.location.href).toBe('index.html');
        });
    });
});
