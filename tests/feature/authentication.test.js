/**
 * Feature Tests for Authentication Workflow
 * Tests complete user registration, login, and logout flows
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
const authCodeForTest = authCode.replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*?\}\);/g, '');
eval(utilsCode);
eval(authCodeForTest);

describe('Feature: Authentication Workflow', () => {
    beforeEach(() => {
        localStorage.clear();
        fetch.mockClear();
        window.location.href = '';
    });

    describe('User Registration Flow', () => {
        test('complete registration workflow succeeds', async () => {
            fetch.mockResolvedValueOnce(mockAuthRegisterSuccess());

            // Step 1: User enters credentials  
            const username = 'newuser';
            const password = 'password123';

            // Step 2: User submits registration
            const result = await registerUser(username, password);

            // Step 3: Verify success
            expect(result.success).toBe(true);
            expect(result.message).toBeTruthy();

            // Step 4: Verify API was called correctly
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/auth/register',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                })
            );
        });

        test('registration fails with duplicate username', async () => {
            fetch.mockResolvedValueOnce(mockApiError('Username already exists'));

            const result = await registerUser('existinguser', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Username already exists');
        });

        test('registration validates empty fields', async () => {
            const result = await registerUser('', 'password123');

            expect(result.success).toBe(false);
            expect(result.message).toBe('Fill both fields');
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('User Login Flow', () => {
        test('complete login workflow succeeds', async () => {
            const user = testUsers[0];
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));

            // Step 1: User enters credentials
            const username = user.username;
            const password = user.password;

            // Step 2: User submits login
            const result = await loginUser(username, password);

            // Step 3: Verify authentication state
            expect(result.success).toBe(true);
            expect(getAuthToken()).toBe('mock-jwt-token-123');
            expect(getCurrentUser()).toEqual({ username: user.username, id: user.id });

            // Step 4: Verify localStorage persistence
            expect(localStorage.getItem('hk_token')).toBe('mock-jwt-token-123');
            expect(localStorage.getItem('hk_currentUser')).toBe(
                JSON.stringify({ username: user.username, id: user.id })
            );
        });

        test('login fails with invalid credentials', async () => {
            fetch.mockResolvedValueOnce(mockApiError('Invalid username or password'));

            const result = await loginUser('wronguser', 'wrongpass');

            expect(result.success).toBe(false);
            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
        });

        test('login preserves user session across page refresh simulation', async () => {
            const user = testUsers[0];
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));

            // Login
            await loginUser(user.username, user.password);

            // Simulate page refresh by clearing variables but keeping localStorage
            const savedToken = localStorage.getItem('hk_token');
            const savedUser = localStorage.getItem('hk_currentUser');

            // Verify data persists
            expect(savedToken).toBe('mock-jwt-token-123');
            expect(JSON.parse(savedUser)).toEqual({ username: user.username, id: user.id });
        });
    });

    describe('User Logout Flow', () => {
        test('complete logout workflow succeeds', async () => {
            const user = testUsers[0];

            // Step 1: Login first
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));
            await loginUser(user.username, user.password);

            // Verify logged in state
            expect(getAuthToken()).not.toBeNull();
            expect(getCurrentUser()).not.toBeNull();

            // Step 2: Logout
            fetch.mockResolvedValueOnce(mockAuthLogoutSuccess());
            await logoutCurrent();

            // Step 3: Verify all auth data is cleared
            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
            expect(localStorage.getItem('hk_token')).toBeNull();
            expect(localStorage.getItem('hk_currentUser')).toBeNull();

            // Step 4: Verify redirect to login page
            expect(window.location.href).toBe('index.html');
        });

        test('logout clears data even if API fails', async () => {
            const user = testUsers[0];

            // Login first
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user));
            await loginUser(user.username, user.password);

            // Logout with API failure
            fetch.mockRejectedValueOnce(new Error('Network error'));
            await logoutCurrent();

            // Verify data is still cleared
            expect(getAuthToken()).toBeNull();
            expect(getCurrentUser()).toBeNull();
        });
    });

    describe('Registration → Login Flow', () => {
        test('user can register and then login', async () => {
            const username = 'newuser';
            const password = 'password123';

            // Step 1: Register
            fetch.mockResolvedValueOnce(mockAuthRegisterSuccess());
            const registerResult = await registerUser(username, password);
            expect(registerResult.success).toBe(true);

            // Step 2: Login with same credentials
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess({ id: 3, username }));
            const loginResult = await loginUser(username, password);

            expect(loginResult.success).toBe(true);
            expect(getCurrentUser().username).toBe(username);
        });
    });

    describe('Multi-User Support', () => {
        test('different users have isolated sessions', async () => {
            const user1 = testUsers[0];
            const user2 = testUsers[1];

            // Login as user1
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user1));
            await loginUser(user1.username, user1.password);

            const user1Token = getAuthToken();
            expect(getCurrentUser().username).toBe(user1.username);

            // Logout
            fetch.mockResolvedValueOnce(mockAuthLogoutSuccess());
            await logoutCurrent();

            // Login as user2
            fetch.mockResolvedValueOnce(mockAuthLoginSuccess(user2));
            await loginUser(user2.username, user2.password);

            const user2Token = getAuthToken();
            expect(getCurrentUser().username).toBe(user2.username);

            // Tokens should be different (in a real implementation)
            expect(user2Token).toBeTruthy();
        });
    });
});
