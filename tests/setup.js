// Mock localStorage
const localStorageMock = (() => {
    let store = {};

    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = value.toString();
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index) => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }
    };
})();

global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
    href: '',
    pathname: '',
    search: '',
    hash: ''
};

// Mock alert, confirm, and prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn();

// Clear all mocks before each test
beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
    alert.mockClear();
    confirm.mockClear();
    prompt.mockClear();
    window.location.href = '';
});

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});
