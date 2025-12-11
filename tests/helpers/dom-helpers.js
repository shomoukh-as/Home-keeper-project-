// Wait for async operations
export const waitFor = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Wait for condition to be true
export const waitForCondition = async (condition, timeout = 5000) => {
    const startTime = Date.now();
    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Condition timeout');
        }
        await waitFor(50);
    }
};

// Simulate input change
export const changeInputValue = (element, value) => {
    element.value = value;
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
};

// Simulate form submission
export const submitForm = (form) => {
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
};

// Simulate click
export const clickElement = (element) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
};

// Get element by test id
export const getByTestId = (testId) => {
    return document.querySelector(`[data-testid="${testId}"]`);
};

// Query selector helper
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// Wait for element to appear
export const waitForElement = async (selector, timeout = 5000) => {
    const startTime = Date.now();
    while (!document.querySelector(selector)) {
        if (Date.now() - startTime > timeout) {
            throw new Error(`Element "${selector}" not found within ${timeout}ms`);
        }
        await waitFor(50);
    }
    return document.querySelector(selector);
};

// Load HTML file
export const loadHTML = async (filePath) => {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(path.resolve(__dirname, '../../', filePath), 'utf8');
    document.documentElement.innerHTML = html;
};

// Load script file
export const loadScript = (scriptPath) => {
    const fs = require('fs');
    const path = require('path');
    const script = fs.readFileSync(path.resolve(__dirname, '../../', scriptPath), 'utf8');
    eval(script);
};

// Create mock event
export const createEvent = (eventType, options = {}) => {
    return new Event(eventType, { bubbles: true, cancelable: true, ...options });
};

// Trigger DOMContentLoaded
export const triggerDOMContentLoaded = () => {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
};
