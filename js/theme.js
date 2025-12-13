/**
 * Theme Toggle - Dark/Light Mode
 * Handles theme switching and persistence via localStorage
 */

(function () {
    'use strict';

    const THEME_KEY = 'homekeeper-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Get the saved theme from localStorage or default to dark
     */
    function getSavedTheme() {
        return localStorage.getItem(THEME_KEY) || DARK_THEME;
    }

    /**
     * Save theme preference to localStorage
     */
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || DARK_THEME;
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

        applyTheme(newTheme);
        saveTheme(newTheme);

        // Add a subtle animation effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    /**
     * Initialize theme on page load
     */
    function initTheme() {
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Set up toggle button listeners
        document.addEventListener('DOMContentLoaded', function () {
            const toggleButtons = document.querySelectorAll('.theme-toggle');
            toggleButtons.forEach(function (btn) {
                btn.addEventListener('click', toggleTheme);
            });
        });
    }

    // Initialize immediately to prevent flash of wrong theme
    initTheme();

    // Expose toggle function globally if needed
    window.toggleTheme = toggleTheme;
})();
