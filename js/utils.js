
// API Configuration
const API_URL = 'http://localhost:3000/api';

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('hk_token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Token management
function setAuthToken(token) {
    localStorage.setItem('hk_token', token);
}

function getAuthToken() {
    return localStorage.getItem('hk_token');
}

function clearAuthToken() {
    localStorage.removeItem('hk_token');
}

// utils: localStorage helpers & basic date helpers
function hk_usersKey() { return 'hk_users' }
function getAllUsers() { return JSON.parse(localStorage.getItem(hk_usersKey()) || '[]') }
function saveAllUsers(u) { localStorage.setItem(hk_usersKey(), JSON.stringify(u)) }
function setCurrentUser(user) { localStorage.setItem('hk_currentUser', JSON.stringify(user)) }
function getCurrentUser() { return JSON.parse(localStorage.getItem('hk_currentUser') || 'null') }
function clearCurrentUser() { localStorage.removeItem('hk_currentUser') }

// per-user storage key
function userKey(suffix) { const u = getCurrentUser(); return u ? `${u.username}__${suffix}` : null }

// get/set arrays for user
function getUserArray(name) { const k = userKey(name); if (!k) return []; return JSON.parse(localStorage.getItem(k) || '[]') }
function setUserArray(name, arr) { const k = userKey(name); if (!k) return; localStorage.setItem(k, JSON.stringify(arr)) }

// date helpers
function daysBetween(dateStr) { const d = new Date(dateStr); const now = new Date(); const diff = (d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / (1000 * 60 * 60 * 24); return Math.ceil(diff) }
function fmt(dateStr) { if (!dateStr) return ''; const d = new Date(dateStr); return d.toLocaleDateString() }
