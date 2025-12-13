

/**
 * Delete an appliance and all related records (cascade delete)
 * Fixes orphaned data issue when appliances are deleted
 */
async function deleteApplianceWithCleanup(applianceId, applianceName) {
    // Delete the appliance first
    await apiRequest(`/appliances/${applianceId}`, 'DELETE');

    // Clean up related warranties
    const warranties = getResourceData('warranties');
    const filteredWarranties = warranties.filter(w => w.appliance_id !== applianceId && w.appliance !== applianceName);
    setResourceData('warranties', filteredWarranties);

    // Clean up related invoices
    const invoices = getResourceData('invoices');
    const filteredInvoices = invoices.filter(i => i.appliance_id !== applianceId && i.appliance !== applianceName);
    setResourceData('invoices', filteredInvoices);

    // Clean up related maintenance records
    const maintenance = getResourceData('maintenance');
    const filteredMaintenance = maintenance.filter(m => m.appliance_id !== applianceId && m.appliance !== applianceName);
    setResourceData('maintenance', filteredMaintenance);

    return { success: true };
}

/**
 * Get warranty status class based on days remaining
 * @param {number} days - days until warranty expires
 * @returns {string} - CSS class name
 */
function getWarrantyStatusClass(days) {
    if (days < 0) return 'warranty-expired';
    if (days <= 30) return 'warranty-danger';
    if (days <= 90) return 'warranty-warning';
    return 'warranty-safe';
}

/**
 * Get warranty badge class based on days remaining
 * @param {number} days - days until warranty expires
 * @returns {string} - badge class
 */
function getWarrantyBadgeClass(days) {
    if (days < 0) return 'expired';
    if (days <= 30) return 'danger';
    if (days <= 90) return 'warning';
    return 'safe';
}

/**
 * Export data to Excel using SheetJS
 * @param {Array} data - array of objects to export
 * @param {string} filename - name of the file (without extension)
 * @param {string} sheetName - name of the worksheet
 */
function exportToExcel(data, filename, sheetName = 'Sheet1') {
    if (typeof XLSX === 'undefined') {
        ToastManager.error('Export library not loaded. Please refresh the page.');
        return;
    }

    if (!data || data.length === 0) {
        ToastManager.warning('No data to export');
        return;
    }

    try {
        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Generate and download file
        XLSX.writeFile(wb, `${filename}.xlsx`);
        ToastManager.success(`Exported ${data.length} records to ${filename}.xlsx`);
    } catch (error) {
        console.error('Export error:', error);
        ToastManager.error('Failed to export data');
    }
}

/**
 * Sort table data by column
 * @param {Array} data - array of objects
 * @param {string} column - column key to sort by
 * @param {string} direction - 'asc' or 'desc'
 */
function sortData(data, column, direction = 'asc') {
    return [...data].sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        // Handle dates
        if (column.includes('date') || column === 'purchase' || column === 'start' || column === 'end' || column === 'warrantyEnd') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        // Handle numbers
        else if (typeof valA === 'number' || !isNaN(parseFloat(valA))) {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        }
        // Handle strings
        else {
            valA = (valA || '').toString().toLowerCase();
            valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filter data by multiple criteria
 * @param {Array} data - array of objects
 * @param {Object} filters - filter criteria
 */
function filterData(data, filters) {
    return data.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
            if (value === null || value === undefined || value === '') continue;

            // Date range filter
            if (key.endsWith('From') && value) {
                const fieldName = key.replace('From', '');
                const itemDate = new Date(item[fieldName]);
                const filterDate = new Date(value);
                if (itemDate < filterDate) return false;
            }
            else if (key.endsWith('To') && value) {
                const fieldName = key.replace('To', '');
                const itemDate = new Date(item[fieldName]);
                const filterDate = new Date(value);
                if (itemDate > filterDate) return false;
            }
            // Warranty status filter
            else if (key === 'warrantyStatus') {
                const days = daysBetween(item.end || item.warrantyEnd);
                const status = getWarrantyBadgeClass(days);
                if (status !== value) return false;
            }
            // Text search
            else if (key === 'search' && value) {
                const searchStr = value.toLowerCase();
                const found = Object.values(item).some(v =>
                    v && v.toString().toLowerCase().includes(searchStr)
                );
                if (!found) return false;
            }
            // Exact match
            else if (item[key] !== undefined && item[key] !== value) {
                return false;
            }
        }
        return true;
    });
}

function getStorageKey(resource) {
    const user = getCurrentUser();
    return user ? `${user.username}__${resource}` : null;
}

function getResourceData(resource) {
    const key = getStorageKey(resource);
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function setResourceData(resource, data) {
    const key = getStorageKey(resource);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Mock API Request Handler - simulates REST API behavior
async function apiRequest(endpoint, method = 'GET', data = null) {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 50));

    // Parse endpoint to get resource and optionally ID
    const parts = endpoint.split('/').filter(p => p);
    const resource = parts[0]; // e.g., 'appliances', 'invoices', 'warranties', 'maintenance', 'auth'
    const action = parts[1] || null;

    // Handle authentication endpoints
    if (resource === 'auth') {
        return handleAuthRequest(action, data);
    }

    let items = getResourceData(resource);
    const id = action; // For non-auth endpoints, action is the ID

    switch (method) {
        case 'GET':
            if (id) {
                const item = items.find(i => i.id === id);
                if (!item) throw new Error('Item not found');
                return { data: item };
            }
            return { data: items };

        case 'POST':
            const newItem = {
                id: generateId(),
                ...data
            };
            // Handle appliance name linking for related resources
            if (data.appliance_name) {
                const appliances = getResourceData('appliances');
                const appliance = appliances.find(a => a.name === data.appliance_name);
                if (appliance) {
                    newItem.appliance = data.appliance_name;
                    newItem.appliance_id = appliance.id;
                }
            }
            items.push(newItem);
            setResourceData(resource, items);
            return { data: newItem };

        case 'PUT':
            const updateIdx = items.findIndex(i => i.id === id);
            if (updateIdx === -1) throw new Error('Item not found');
            // Handle appliance name linking for related resources
            if (data.appliance_name) {
                const appliances = getResourceData('appliances');
                const appliance = appliances.find(a => a.name === data.appliance_name);
                if (appliance) {
                    data.appliance = data.appliance_name;
                    data.appliance_id = appliance.id;
                }
            }
            items[updateIdx] = { ...items[updateIdx], ...data };
            setResourceData(resource, items);
            return { data: items[updateIdx] };

        case 'DELETE':
            const deleteIdx = items.findIndex(i => i.id === id);
            if (deleteIdx === -1) throw new Error('Item not found');
            items.splice(deleteIdx, 1);
            setResourceData(resource, items);
            return { success: true };

        default:
            throw new Error('Unsupported method');
    }
}

// Handle authentication requests
function handleAuthRequest(action, data) {
    const users = getAllUsers();

    switch (action) {
        case 'register':
            if (!data.username || !data.password) {
                throw new Error('Username and password are required');
            }
            // Check if user already exists
            const existingUser = users.find(u => u.username === data.username);
            if (existingUser) {
                throw new Error('Username already exists');
            }
            // Create new user
            const newUser = {
                id: generateId(),
                username: data.username,
                password: data.password
            };
            users.push(newUser);
            saveAllUsers(users);
            return { success: true, message: 'Registration successful' };

        case 'login':
            if (!data.username || !data.password) {
                throw new Error('Username and password are required');
            }
            const user = users.find(u => u.username === data.username && u.password === data.password);
            if (!user) {
                throw new Error('Invalid username or password');
            }
            // Generate a mock token
            const token = 'mock_token_' + generateId();
            return {
                success: true,
                token: token,
                user: { id: user.id, username: user.username },
                message: 'Login successful'
            };

        case 'logout':
            return { success: true, message: 'Logged out successfully' };

        default:
            throw new Error('Unknown auth action');
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
