// js/utils.js

/**
 * Search Engine Class
 * Implements fuzzy search functionality for QNEET resources
 */
export class SearchEngine {
    constructor(resources) {
        this.resources = resources || [];
        this.fuse = null;
        
        // Initialize Fuse.js if available
        if (typeof Fuse !== 'undefined') {
            this.fuse = new Fuse(this.resources, {
                keys: ['title', 'description', 'tags', 'subject'],
                threshold: 0.3,
                includeScore: true,
                includeMatches: true
            });
        }
    }

    /**
     * Perform search on resources
     * @param {string} query - Search query
     * @returns {Array} Array of matching resources
     */
    search(query) {
        if (!query || query.trim() === '') {
            return this.resources;
        }
        
        // If Fuse.js is available, use it for fuzzy search
        if (this.fuse) {
            const results = this.fuse.search(query);
            return results.map(result => result.item);
        }
        
        // Fallback to simple search
        const lowerQuery = query.toLowerCase();
        return this.resources.filter(resource => 
            resource.title.toLowerCase().includes(lowerQuery) ||
            resource.description.toLowerCase().includes(lowerQuery) ||
            resource.subject.toLowerCase().includes(lowerQuery) ||
            resource.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Update resources for searching
     * @param {Array} resources - New resources array
     */
    updateResources(resources) {
        this.resources = resources;
        if (this.fuse) {
            this.fuse.setCollection(resources);
        }
    }
}

/**
 * Date Utility Functions
 */
export class DateUtils {
    /**
     * Format a date as a human-readable string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
        if (!date) return '';
        
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format a date as relative time (e.g., "2 days ago")
     * @param {string|Date} date - Date to format
     * @returns {string} Relative time string
     */
    static formatRelativeTime(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }
}

/**
 * File Utility Functions
 */
export class FileUtils {
    /**
     * Format file size in human-readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Get file extension from filename
     * @param {string} filename - Filename
     * @returns {string} File extension
     */
    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    /**
     * Get file type based on extension
     * @param {string} filename - Filename
     * @returns {string} File type
     */
    static getFileType(filename) {
        const ext = this.getFileExtension(filename).toLowerCase();
        const types = {
            'pdf': 'PDF',
            'doc': 'Document',
            'docx': 'Document',
            'txt': 'Text',
            'jpg': 'Image',
            'jpeg': 'Image',
            'png': 'Image',
            'gif': 'Image',
            'mp4': 'Video',
            'mov': 'Video',
            'avi': 'Video'
        };
        
        return types[ext] || 'File';
    }
}

/**
 * UI Utility Functions
 */
export class UIUtils {
    /**
     * Debounce function to limit rate of execution
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function to limit rate of execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Scroll to element smoothly
     * @param {string|Element} target - Target element or selector
     * @param {number} offset - Offset from top
     */
    static scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
}

/**
 * Validation Utility Functions
 */
export class ValidationUtils {
    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate resource title
     * @param {string} title - Title to validate
     * @returns {boolean} True if valid
     */
    static validateResourceTitle(title) {
        return title && title.trim().length > 0 && title.trim().length <= 100;
    }

    /**
     * Validate note content
     * @param {string} content - Note content to validate
     * @returns {boolean} True if valid
     */
    static validateNoteContent(content) {
        return content && content.trim().length > 0 && content.trim().length <= 5000;
    }
}

/**
 * Data Processing Utility Functions
 */
export class DataUtils {
    /**
     * Group array of objects by a property
     * @param {Array} array - Array to group
     * @param {string} key - Property to group by
     * @returns {Object} Grouped object
     */
    static groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {});
    }

    /**
     * Sort array of objects by property
     * @param {Array} array - Array to sort
     * @param {string} key - Property to sort by
     * @param {boolean} descending - Sort in descending order
     * @returns {Array} Sorted array
     */
    static sortBy(array, key, descending = false) {
        return array.sort((a, b) => {
            if (a[key] < b[key]) return descending ? 1 : -1;
            if (a[key] > b[key]) return descending ? -1 : 1;
            return 0;
        });
    }

    /**
     * Remove duplicates from array of objects
     * @param {Array} array - Array to deduplicate
     * @param {string} key - Property to check for duplicates
     * @returns {Array} Deduplicated array
     */
    static removeDuplicates(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            } else {
                seen.add(value);
                return true;
            }
        });
    }
}

/**
 * Accessibility Utility Functions
 */
export class AccessibilityUtils {
    /**
     * Set focus on an element with focus trap
     * @param {Element} element - Element to focus
     */
    static focusElement(element) {
        if (element) {
            element.focus();
            element.setAttribute('tabindex', '-1');
        }
    }

    /**
     * Remove focus trap from element
     * @param {Element} element - Element to remove focus trap
     */
    static removeFocusTrap(element) {
        if (element) {
            element.removeAttribute('tabindex');
        }
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} type - Type of announcement (polite, assertive)
     */
    static announceToScreenReader(message, type = 'polite') {
        let announcement = document.getElementById('sr-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.setAttribute('id', 'sr-announcement');
            announcement.setAttribute('aria-live', type);
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            document.body.appendChild(announcement);
        }
        announcement.textContent = message;
    }
}

/**
 * Export all utilities as named exports
 */
export {
    SearchEngine,
    DateUtils,
    FileUtils,
    UIUtils,
    ValidationUtils,
    DataUtils,
    AccessibilityUtils
};

// Export default object with all utilities
export default {
    SearchEngine,
    DateUtils,
    FileUtils,
    UIUtils,
    ValidationUtils,
    DataUtils,
    AccessibilityUtils
};