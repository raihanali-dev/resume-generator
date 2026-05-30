/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

class Utils {
    static WATERMARK = 'Created by Rei';

    static getWatermarkHtml() {
        return `<div class="resume-watermark-first" aria-hidden="true"><span>${Utils.WATERMARK}</span></div>`;
    }

    /**
     * Debounce function to limit the rate of function calls
     * @param {Function} func - The function to debounce
     * @param {number} wait - The delay in milliseconds
     * @param {boolean} immediate - Whether to execute immediately
     * @returns {Function} The debounced function
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    /**
     * Throttle function to limit the rate of function calls
     * @param {Function} func - The function to throttle
     * @param {number} limit - The time limit in milliseconds
     * @returns {Function} The throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Generate a unique ID
     * @param {number} length - The length of the ID
     * @returns {string} A unique ID string
     */
    static generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Validate email address
     * @param {string} email - The email to validate
     * @returns {boolean} Whether the email is valid
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL
     * @param {string} url - The URL to validate
     * @returns {boolean} Whether the URL is valid
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate phone number (basic validation)
     * @param {string} phone - The phone number to validate
     * @returns {boolean} Whether the phone number is valid
     */
    static isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
    }

    /**
     * Format date for display
     * @param {string} dateString - The date string to format
     * @param {string} format - The format type ('short', 'long', 'numeric')
     * @returns {string} The formatted date
     */
    static formatDate(dateString, format = 'short') {
        if (!dateString) return '';
        
        const date = new Date(dateString + '-01');
        if (isNaN(date.getTime())) return dateString;
        
        const options = {
            short: { year: 'numeric', month: 'short' },
            long: { year: 'numeric', month: 'long' },
            numeric: { year: 'numeric', month: '2-digit' }
        };
        
        return date.toLocaleDateString('en-US', options[format] || options.short);
    }

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - The HTML string to sanitize
     * @returns {string} The sanitized HTML
     */
    static sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Deep clone an object
     * @param {any} obj - The object to clone
     * @returns {any} The cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }

    /**
     * Check if an object is empty
     * @param {object} obj - The object to check
     * @returns {boolean} Whether the object is empty
     */
    static isEmpty(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    }

    /**
     * Capitalize first letter of a string
     * @param {string} str - The string to capitalize
     * @returns {string} The capitalized string
     */
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert string to title case
     * @param {string} str - The string to convert
     * @returns {string} The title case string
     */
    static toTitleCase(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    /**
     * Remove HTML tags from string
     * @param {string} html - The HTML string
     * @returns {string} The plain text
     */
    static stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    /**
     * Truncate string to specified length
     * @param {string} str - The string to truncate
     * @param {number} length - The maximum length
     * @param {string} suffix - The suffix to add
     * @returns {string} The truncated string
     */
    static truncate(str, length = 100, suffix = '...') {
        if (!str || str.length <= length) return str;
        return str.slice(0, length) + suffix;
    }

    /**
     * Show loading overlay
     * @param {string} message - The loading message
     */
    static showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            const messageElement = overlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            overlay.style.display = 'flex';
        }
    }

    /**
     * Hide loading overlay
     */
    static hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Show toast notification
     * @param {string} message - The message to show
     * @param {string} type - The type of toast ('success', 'error', 'warning', 'info')
     * @param {number} duration - How long to show the toast
     */
    static showToast(message, type = 'info', duration = 3000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type]}"></i>
                <span>${Utils.sanitizeHtml(message)}</span>
                <button class="toast-close" aria-label="Dismiss notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

        document.body.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }

    /**
     * Local storage helpers with error handling
     */
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },

        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    };

    /**
     * Download file helper
     * @param {string} content - The file content
     * @param {string} filename - The filename
     * @param {string} mimeType - The MIME type
     */
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - The text to copy
     * @returns {Promise<boolean>} Whether the copy was successful
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (err) {
                textArea.remove();
                console.error('Failed to copy text:', err);
                return false;
            }
        }
    }

    /**
     * Scroll to element smoothly
     * @param {Element|string} element - The element or selector to scroll to
     * @param {object} options - Scroll options
     */
    static scrollTo(element, options = {}) {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        target.scrollIntoView({ ...defaultOptions, ...options });
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - The element to check
     * @param {number} threshold - The threshold percentage (0-1)
     * @returns {boolean} Whether the element is in viewport
     */
    static isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;

        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

        return vertInView && horInView;
    }

    /**
     * Format file size in human readable format
     * @param {number} bytes - The size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} The formatted size
     */
    static formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
