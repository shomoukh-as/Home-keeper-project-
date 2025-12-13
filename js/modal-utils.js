/**
 * Modal Utilities - Shared modal functionality
 * Provides click-outside-to-close, loading states, and inline validation
 */

// Toast notification system
const ToastManager = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 5000, undoCallback = null) {
        this.init();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let html = `<span class="toast-message">${message}</span>`;
        if (undoCallback) {
            html += `<button class="toast-undo">Undo</button>`;
        }
        html += `<button class="toast-close">&times;</button>`;
        toast.innerHTML = html;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('toast-visible'));

        const removeToast = () => {
            toast.classList.remove('toast-visible');
            setTimeout(() => toast.remove(), 300);
        };

        // Undo button
        if (undoCallback) {
            const undoBtn = toast.querySelector('.toast-undo');
            undoBtn.onclick = () => {
                undoCallback();
                removeToast();
            };
        }

        // Close button
        toast.querySelector('.toast-close').onclick = removeToast;

        // Auto-remove
        if (duration > 0) {
            setTimeout(removeToast, duration);
        }

        return { remove: removeToast };
    },

    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    },

    undoable(message, undoCallback, duration = 5000) {
        return this.show(message, 'warning', duration, undoCallback);
    }
};

// Modal utilities
const ModalUtils = {
    /**
     * Initialize click-outside-to-close for a modal
     */
    initClickOutside(modalElement, closeCallback) {
        modalElement.addEventListener('click', (e) => {
            // Only close if clicking directly on the modal backdrop, not its children
            if (e.target === modalElement) {
                closeCallback();
            }
        });
    },

    /**
     * Add escape key handler
     */
    initEscapeClose(modalElement, closeCallback) {
        const handler = (e) => {
            if (e.key === 'Escape' && !modalElement.classList.contains('hidden')) {
                closeCallback();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    },

    /**
     * Show loading state on a button
     */
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="spinner"></span> Saving...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Save';
        }
    }
};

// Form validation utilities
const FormValidator = {
    /**
     * Validate a single field and show/hide error
     */
    validateField(input, rules = {}) {
        const value = input.value.trim();
        let error = null;

        if (rules.required && !value) {
            error = rules.message || 'This field is required';
        } else if (rules.minLength && value.length < rules.minLength) {
            error = `Must be at least ${rules.minLength} characters`;
        } else if (rules.pattern && !rules.pattern.test(value)) {
            error = rules.patternMessage || 'Invalid format';
        } else if (rules.custom && !rules.custom(value)) {
            error = rules.message || 'Invalid value';
        }

        this.showFieldError(input, error);
        return error === null;
    },

    /**
     * Show error message for a field
     */
    showFieldError(input, errorMessage) {
        // Remove existing error
        const existingError = input.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();

        input.classList.remove('input-error');

        if (errorMessage) {
            input.classList.add('input-error');
            const errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.textContent = errorMessage;
            input.parentElement.appendChild(errorEl);
        }
    },

    /**
     * Clear all errors in a form/container
     */
    clearErrors(container) {
        container.querySelectorAll('.field-error').forEach(el => el.remove());
        container.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    },

    /**
     * Validate all fields in a form
     */
    validateForm(container, fieldRules) {
        let isValid = true;

        for (const [fieldId, rules] of Object.entries(fieldRules)) {
            const input = container.querySelector(`#${fieldId}`);
            if (input && !this.validateField(input, rules)) {
                isValid = false;
            }
        }

        return isValid;
    }
};

// Undo delete functionality
const UndoManager = {
    pendingDeletes: new Map(),

    /**
     * Stage a delete operation with undo capability
     */
    stageDelete(itemType, itemId, itemData, deleteCallback, restoreCallback) {
        const key = `${itemType}_${itemId}`;

        // Store the data for potential restoration
        this.pendingDeletes.set(key, {
            itemType,
            itemId,
            itemData,
            restoreCallback
        });

        // Execute the delete
        deleteCallback();

        // Show undo toast
        ToastManager.undoable(
            `${itemType} deleted`,
            () => this.restore(key),
            5000
        );

        // Clear from pending after timeout
        setTimeout(() => {
            this.pendingDeletes.delete(key);
        }, 5500);
    },

    /**
     * Restore a deleted item
     */
    restore(key) {
        const pending = this.pendingDeletes.get(key);
        if (pending && pending.restoreCallback) {
            pending.restoreCallback(pending.itemData);
            this.pendingDeletes.delete(key);
            ToastManager.success(`${pending.itemType} restored`);
        }
    }
};
