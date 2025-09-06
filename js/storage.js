// js/storage.js

/**
 * QNEET Storage Class
 * Handles all IndexedDB operations for persistent data storage
 */
export class QNEETStorage {
    constructor() {
        this.dbName = 'QNEETDatabase';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize the IndexedDB database
     * @returns {Promise<IDBDatabase>} Promise that resolves with the database instance
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('resources')) {
                    const resourceStore = db.createObjectStore('resources', { keyPath: 'id' });
                    resourceStore.createIndex('category', 'category', { unique: false });
                    resourceStore.createIndex('subject', 'subject', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('notes')) {
                    const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
                    noteStore.createIndex('resourceId', 'resourceId', { unique: false });
                    noteStore.createIndex('date', 'date', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('downloads')) {
                    db.createObjectStore('downloads', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                console.log('Database structure created');
            };
        });
    }

    /**
     * Add a resource to the database
     * @param {Object} resource - Resource object to add
     * @returns {Promise<void>}
     */
    async addResource(resource) {
        const transaction = this.db.transaction(['resources'], 'readwrite');
        const store = transaction.objectStore('resources');
        await store.add(resource);
    }

    /**
     * Get a resource by ID
     * @param {number} id - Resource ID
     * @returns {Promise<Object|null>} Resource object or null if not found
     */
    async getResource(id) {
        const transaction = this.db.transaction(['resources'], 'readonly');
        const store = transaction.objectStore('resources');
        return store.get(id);
    }

    /**
     * Get all resources
     * @returns {Promise<Array>} Array of all resources
     */
    async getAllResources() {
        const transaction = this.db.transaction(['resources'], 'readonly');
        const store = transaction.objectStore('resources');
        return store.getAll();
    }

    /**
     * Update a resource
     * @param {Object} resource - Resource object with updated data
     * @returns {Promise<void>}
     */
    async updateResource(resource) {
        const transaction = this.db.transaction(['resources'], 'readwrite');
        const store = transaction.objectStore('resources');
        await store.put(resource);
    }

    /**
     * Delete a resource by ID
     * @param {number} id - Resource ID
     * @returns {Promise<void>}
     */
    async deleteResource(id) {
        const transaction = this.db.transaction(['resources'], 'readwrite');
        const store = transaction.objectStore('resources');
        await store.delete(id);
    }

    /**
     * Add a resource to favorites
     * @param {number} resourceId - Resource ID to add to favorites
     * @returns {Promise<void>}
     */
    async addFavorite(resourceId) {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        await store.add({ id: resourceId, date: new Date().toISOString() });
    }

    /**
     * Remove a resource from favorites
     * @param {number} resourceId - Resource ID to remove from favorites
     * @returns {Promise<void>}
     */
    async removeFavorite(resourceId) {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const store = transaction.objectStore('favorites');
        await store.delete(resourceId);
    }

    /**
     * Get all favorite resource IDs
     * @returns {Promise<Array>} Array of favorite resource IDs
     */
    async getFavorites() {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const favorites = await store.getAll();
        return favorites.map(fav => fav.id);
    }

    /**
     * Check if a resource is favorited
     * @param {number} resourceId - Resource ID to check
     * @returns {Promise<boolean>} True if resource is favorited
     */
    async isFavorite(resourceId) {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const store = transaction.objectStore('favorites');
        const result = await store.get(resourceId);
        return !!result;
    }

    /**
     * Add a note
     * @param {Object} note - Note object to add
     * @returns {Promise<void>}
     */
    async addNote(note) {
        const transaction = this.db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        await store.add(note);
    }

    /**
     * Get notes for a specific resource
     * @param {number} resourceId - Resource ID
     * @returns {Promise<Array>} Array of notes for the resource
     */
    async getNotes(resourceId) {
        const transaction = this.db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const index = store.index('resourceId');
        return index.getAll(resourceId);
    }

    /**
     * Get all notes
     * @returns {Promise<Object>} Object with resource IDs as keys and arrays of notes as values
     */
    async getAllNotes() {
        const transaction = this.db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const allNotes = await store.getAll();
        
        // Group notes by resource ID
        const notesByResource = {};
        allNotes.forEach(note => {
            if (!notesByResource[note.resourceId]) {
                notesByResource[note.resourceId] = [];
            }
            notesByResource[note.resourceId].push(note);
        });
        
        return notesByResource;
    }

    /**
     * Update a note
     * @param {Object} note - Note object with updated data
     * @returns {Promise<void>}
     */
    async updateNote(note) {
        const transaction = this.db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        await store.put(note);
    }

    /**
     * Delete a note by ID
     * @param {number} noteId - Note ID
     * @returns {Promise<void>}
     */
    async deleteNote(noteId) {
        const transaction = this.db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        await store.delete(noteId);
    }

    /**
     * Add a download record
     * @param {Object} download - Download object to add
     * @returns {Promise<void>}
     */
    async addDownload(download) {
        const transaction = this.db.transaction(['downloads'], 'readwrite');
        const store = transaction.objectStore('downloads');
        await store.add(download);
    }

    /**
     * Get all downloads
     * @returns {Promise<Array>} Array of download records
     */
    async getDownloads() {
        const transaction = this.db.transaction(['downloads'], 'readonly');
        const store = transaction.objectStore('downloads');
        return store.getAll();
    }

    /**
     * Update a download record
     * @param {Object} download - Download object with updated data
     * @returns {Promise<void>}
     */
    async updateDownload(download) {
        const transaction = this.db.transaction(['downloads'], 'readwrite');
        const store = transaction.objectStore('downloads');
        await store.put(download);
    }

    /**
     * Delete a download record by ID
     * @param {number} downloadId - Download ID
     * @returns {Promise<void>}
     */
    async deleteDownload(downloadId) {
        const transaction = this.db.transaction(['downloads'], 'readwrite');
        const store = transaction.objectStore('downloads');
        await store.delete(downloadId);
    }

    /**
     * Save a setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<void>}
     */
    async saveSetting(key, value) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        await store.put({ key, value });
    }

    /**
     * Get a setting value
     * @param {string} key - Setting key
     * @returns {Promise<any>} Setting value or undefined if not found
     */
    async getSetting(key) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const result = await store.get(key);
        return result ? result.value : undefined;
    }

    /**
     * Export all data for backup
     * @returns {Promise<Object>} Object containing all data
     */
    async exportData() {
        const data = {};
        
        // Export resources
        data.resources = await this.getAllResources();
        
        // Export favorites
        data.favorites = await this.getFavorites();
        
        // Export notes
        data.notes = await this.getAllNotes();
        
        // Export downloads
        data.downloads = await this.getDownloads();
        
        // Export settings
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        data.settings = await store.getAll();
        
        return data;
    }

    /**
     * Import data from backup
     * @param {Object} data - Data to import
     * @returns {Promise<void>}
     */
    async importData(data) {
        // Clear existing data
        await this.clearAllData();
        
        // Import resources
        if (data.resources) {
            const transaction = this.db.transaction(['resources'], 'readwrite');
            const store = transaction.objectStore('resources');
            for (const resource of data.resources) {
                await store.add(resource);
            }
        }
        
        // Import favorites
        if (data.favorites) {
            const transaction = this.db.transaction(['favorites'], 'readwrite');
            const store = transaction.objectStore('favorites');
            for (const favorite of data.favorites) {
                await store.add({ id: favorite, date: new Date().toISOString() });
            }
        }
        
        // Import notes
        if (data.notes) {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            for (const resourceId in data.notes) {
                for (const note of data.notes[resourceId]) {
                    await store.add(note);
                }
            }
        }
        
        // Import downloads
        if (data.downloads) {
            const transaction = this.db.transaction(['downloads'], 'readwrite');
            const store = transaction.objectStore('downloads');
            for (const download of data.downloads) {
                await store.add(download);
            }
        }
        
        // Import settings
        if (data.settings) {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            for (const setting of data.settings) {
                await store.add(setting);
            }
        }
    }

    /**
     * Clear all data from the database
     * @returns {Promise<void>}
     */
    async clearAllData() {
        const stores = ['resources', 'favorites', 'notes', 'downloads', 'settings'];
        
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await store.clear();
        }
    }

    /**
     * Close the database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Export the class as default
export default QNEETStorage;