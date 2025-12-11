import { testUsers, testAppliances, testInvoices, testWarranties } from './fixtures.js';

// Mock successful API response
export const mockApiSuccess = (data) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data, message: 'Success' })
    });
};

// Mock failed API response
export const mockApiError = (message = 'API Error') => {
    return Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ success: false, message })
    });
};

// Mock network error
export const mockNetworkError = () => {
    return Promise.reject(new Error('Network error'));
};

// Mock auth responses
export const mockAuthRegisterSuccess = () => {
    return Promise.resolve({
        ok: true,
        status: 201,
        json: async () => ({
            success: true,
            message: 'User registered successfully'
        })
    });
};

export const mockAuthLoginSuccess = (user = testUsers[0]) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
            success: true,
            message: 'Login successful',
            token: 'mock-jwt-token-123',
            user: { id: user.id, username: user.username }
        })
    });
};

export const mockAuthLogoutSuccess = () => {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
            success: true,
            message: 'Logout successful'
        })
    });
};

// Mock appliance responses
export const mockGetAppliances = () => {
    return mockApiSuccess(testAppliances);
};

export const mockCreateAppliance = (appliance) => {
    return mockApiSuccess({ ...appliance, id: Date.now() });
};

export const mockUpdateAppliance = (appliance) => {
    return mockApiSuccess(appliance);
};

export const mockDeleteAppliance = () => {
    return mockApiSuccess({ message: 'Appliance deleted' });
};

// Mock invoice responses
export const mockGetInvoices = () => {
    return mockApiSuccess(testInvoices);
};

export const mockCreateInvoice = (invoice) => {
    return mockApiSuccess({ ...invoice, id: Date.now() });
};

export const mockUpdateInvoice = (invoice) => {
    return mockApiSuccess(invoice);
};

export const mockDeleteInvoice = () => {
    return mockApiSuccess({ message: 'Invoice deleted' });
};

// Mock warranty responses
export const mockGetWarranties = () => {
    return mockApiSuccess(testWarranties);
};

export const mockCreateWarranty = (warranty) => {
    return mockApiSuccess({ ...warranty, id: Date.now() });
};

export const mockUpdateWarranty = (warranty) => {
    return mockApiSuccess(warranty);
};

export const mockDeleteWarranty = () => {
    return mockApiSuccess({ message: 'Warranty deleted' });
};

// Setup fetch mock for specific endpoint
export const mockFetchFor = (endpoint, method, response) => {
    global.fetch.mockImplementation((url, options) => {
        if (url.includes(endpoint) && (!method || options?.method === method)) {
            return response;
        }
        return mockApiError('Not found');
    });
};
