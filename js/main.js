// js/main.js

// Import required modules
import { QNEETStorage } from './storage.js';
import { PDFViewer } from './pdf-viewer.js';
import { SearchEngine } from './utils.js';

// Initialize Lucide Icons
lucide.createIcons();

// Initialize Notyf notifications
const notyf = new Notyf({
    duration: 3000,
    position: {
        x: 'right',
        y: 'top',
    },
    types: [
        {
            type: 'success',
            background: '#10B981',
            icon: {
                className: 'notyf-icon',
                tagName: 'i',
                text: '<i data-lucide="check-circle" class="w-5 h-5 text-white"></i>'
            }
        },
        {
            type: 'error',
            background: '#EF4444',
            icon: {
                className: 'notyf-icon',
                tagName: 'i',
                text: '<i data-lucide="x-circle" class="w-5 h-5 text-white"></i>'
            }
        },
        {
            type: 'warning',
            background: '#F59E0B',
            icon: {
                className: 'notyf-icon',
                tagName: 'i',
                text: '<i data-lucide="alert-circle" class="w-5 h-5 text-white"></i>'
            }
        }
    ]
});

// DOM Elements
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const themeToggle = document.getElementById('theme-toggle');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const lightTheme = document.getElementById('light-theme');
const darkTheme = document.getElementById('dark-theme');
const autoTheme = document.getElementById('auto-theme');
const backToDashboard = document.getElementById('back-to-dashboard');
const dashboardView = document.getElementById('dashboard-view');
const resourceViewer = document.getElementById('resource-viewer');
const saveNotesBtn = document.getElementById('save-notes');
const notesTextarea = document.getElementById('notes-textarea');
const downloadManager = document.getElementById('download-manager');
const closeDownloads = document.getElementById('close-downloads');
const resourceGrid = document.getElementById('resource-grid');
const downloadsContainer = document.getElementById('downloads-container');
const notesContainer = document.getElementById('notes-container');
const bookmarkCount = document.getElementById('bookmark-count');
const bookmarksBtn = document.getElementById('bookmarks-btn');
const searchBar = document.getElementById('search-bar');
const mobileSearch = document.getElementById('mobile-search');
const navLinks = document.querySelectorAll('.nav-link');
const categoryCards = document.querySelectorAll('.category-card');
const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
const previewResourceBtn = document.getElementById('preview-resource');
const downloadResourceBtn = document.getElementById('download-resource');
const previewPdfBtn = document.getElementById('preview-pdf-btn');
const fontSmall = document.getElementById('font-small');
const fontMedium = document.getElementById('font-medium');
const fontLarge = document.getElementById('font-large');
const backupData = document.getElementById('backup-data');
const restoreData = document.getElementById('restore-data');
const clearData = document.getElementById('clear-data');

// State management
let currentCategory = 'dashboard';
let currentResource = null;
let favorites = [];
let notes = {};
let downloads = [];
let activeFilters = [];
let resources = [];
let searchEngine = null;

// Storage instance
const storage = new QNEETStorage();

// PDF Viewer instance
const pdfViewer = new PDFViewer('pdf-viewer');

// Initialize the app
async function initApp() {
    try {
        // Initialize storage
        await storage.init();
        
        // Load initial data
        await loadData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize theme
        initTheme();
        
        // Render initial view
        renderResources();
        renderDownloads();
        renderNotes();
        updateBookmarkCount();
        
        // Initialize search engine
        searchEngine = new SearchEngine(resources);
        
        console.log('QNEET App initialized successfully');
    } catch (error) {
        console.error('Failed to initialize QNEET App:', error);
        notyf.error('Failed to initialize application');
    }
}

// Load data from storage
async function loadData() {
    try {
        // Load resources (in a real app, this would come from IndexedDB or API)
        resources = await loadSampleResources();
        
        // Load user data
        favorites = await storage.getFavorites() || [];
        notes = await storage.getAllNotes() || {};
        downloads = await storage.getDownloads() || [];
    } catch (error) {
        console.error('Error loading data:', error);
        notyf.error('Failed to load user data');
    }
}

// Load sample resources (in a real app, this would come from IndexedDB or API)
async function loadSampleResources() {
    return [
        {
            id: 1,
            title: "Physics Formula Sheet",
            description: "Comprehensive formula sheet for NEET Physics covering all important equations and concepts.",
            subject: "Physics",
            type: "PDF",
            tags: ["Formulas", "Physics", "NEET 2023"],
            date: "12 March 2023",
            size: "2.4 MB",
            thumbnail: "from-blue-400 to-indigo-600",
            category: "formula-sheets",
            filePath: "assets/pdfs/physics-formulas.pdf"
        },
        {
            id: 2,
            title: "Organic Chemistry Notes",
            description: "Detailed notes on organic chemistry reactions and mechanisms for NEET preparation.",
            subject: "Chemistry",
            type: "Note",
            tags: ["Organic", "Chemistry", "Reactions"],
            date: "15 March 2023",
            size: "1.8 MB",
            thumbnail: "from-green-400 to-emerald-600",
            category: "short-notes",
            filePath: "assets/pdfs/organic-chemistry.pdf"
        },
        {
            id: 3,
            title: "Biology Mindmap",
            description: "Visual mindmap covering all important topics in NEET Biology for quick revision.",
            subject: "Biology",
            type: "Mindmap",
            tags: ["Mindmap", "Biology", "Revision"],
            date: "18 March 2023",
            size: "3.2 MB",
            thumbnail: "from-orange-400 to-amber-600",
            category: "mindmaps",
            filePath: "assets/pdfs/biology-mindmap.pdf"
        },
        {
            id: 4,
            title: "NEET 2022 Question Paper",
            description: "Previous year question paper with solutions for NEET 2022.",
            subject: "All",
            type: "PYQ",
            tags: ["PYQ", "NEET 2022", "Solutions"],
            date: "20 March 2023",
            size: "4.1 MB",
            thumbnail: "from-purple-400 to-fuchsia-600",
            category: "pyqs",
            filePath: "assets/pdfs/neet-2022.pdf"
        },
        {
            id: 5,
            title: "Physics Problem Solving Guide",
            description: "Step-by-step guide to solving complex physics problems for NEET.",
            subject: "Physics",
            type: "Guide",
            tags: ["Physics", "Problem Solving", "Strategy"],
            date: "22 March 2023",
            size: "2.7 MB",
            thumbnail: "from-cyan-400 to-teal-600",
            category: "strategy-guides",
            filePath: "assets/pdfs/physics-problem-solving.pdf"
        },
        {
            id: 6,
            title: "Chemistry NCERT Summary",
            description: "Chapter-wise summary of NCERT Chemistry for quick revision.",
            subject: "Chemistry",
            type: "Summary",
            tags: ["Chemistry", "NCERT", "Summary"],
            date: "25 March 2023",
            size: "1.9 MB",
            thumbnail: "from-lime-400 to-green-600",
            category: "short-notes",
            filePath: "assets/pdfs/chemistry-ncert-summary.pdf"
        }
    ];
}

// Set up event listeners
function setupEventListeners() {
    // Toggle sidebar on mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('hidden');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.add('hidden');
    });
    
    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        lucide.createIcons();
    });
    
    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
    
    // Theme Selection
    lightTheme.addEventListener('click', () => {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        lucide.createIcons();
    });
    
    darkTheme.addEventListener('click', () => {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        lucide.createIcons();
    });
    
    autoTheme.addEventListener('click', () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        localStorage.setItem('theme', 'auto');
        lucide.createIcons();
    });
    
    // View Resource
    document.addEventListener('click', (e) => {
        if (e.target.closest('.preview-btn')) {
            const resourceId = e.target.closest('.preview-btn').dataset.id;
            viewResource(resourceId);
        }
    });
    
    // Back to Dashboard
    backToDashboard.addEventListener('click', () => {
        resourceViewer.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    });
    
    // Save Notes
    saveNotesBtn.addEventListener('click', () => {
        if (notesTextarea.value.trim() !== '') {
            saveNote(notesTextarea.value);
            notesTextarea.value = '';
            notyf.success('Notes saved successfully!');
        } else {
            notyf.error('Please enter some notes before saving.');
        }
    });
    
    // Favorite Toggle
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            const button = e.target.closest('.favorite-btn');
            const resourceId = button.dataset.id;
            toggleFavorite(resourceId, button);
        }
    });
    
    // Download Resource
    document.addEventListener('click', (e) => {
        if (e.target.closest('.download-btn')) {
            const resourceId = e.target.closest('.download-btn').dataset.id;
            downloadResource(resourceId);
        }
    });
    
    // Download Resource from viewer
    downloadResourceBtn.addEventListener('click', () => {
        if (currentResource) {
            downloadResource(currentResource.id);
        }
    });
    
    // Preview Resource from viewer
    previewResourceBtn.addEventListener('click', () => {
        if (currentResource) {
            previewResource(currentResource.id);
        }
    });
    
    // Preview PDF
    previewPdfBtn.addEventListener('click', () => {
        if (currentResource) {
            previewResource(currentResource.id);
        }
    });
    
    // Close Downloads
    closeDownloads.addEventListener('click', () => {
        downloadManager.classList.add('hidden');
    });
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            switchCategory(category);
        });
    });
    
    // Category Cards
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            switchCategory(category);
        });
    });
    
    // Filters
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters();
        });
    });
    
    // Search
    searchBar.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
    
    mobileSearch.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
    
    // Font Size
    fontSmall.addEventListener('click', () => {
        document.body.style.fontSize = '14px';
        localStorage.setItem('fontSize', 'small');
    });
    
    fontMedium.addEventListener('click', () => {
        document.body.style.fontSize = '16px';
        localStorage.setItem('fontSize', 'medium');
    });
    
    fontLarge.addEventListener('click', () => {
        document.body.style.fontSize = '18px';
        localStorage.setItem('fontSize', 'large');
    });
    
    // Data Management
    backupData.addEventListener('click', () => {
        backupUserData();
    });
    
    restoreData.addEventListener('click', () => {
        restoreUserData();
    });
    
    clearData.addEventListener('click', () => {
        clearUserData();
    });
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
    }
    
    // Set font size
    if (fontSize === 'small') {
        document.body.style.fontSize = '14px';
    } else if (fontSize === 'large') {
        document.body.style.fontSize = '18px';
    } else {
        document.body.style.fontSize = '16px';
    }
}

// Switch category
function switchCategory(category) {
    currentCategory = category;
    
    // Update active nav link
    navLinks.forEach(link => {
        if (link.dataset.category === category) {
            link.classList.add('bg-blue-50', 'dark:bg-slate-700', 'text-blue-600', 'dark:text-blue-400');
            link.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-700');
        } else {
            link.classList.remove('bg-blue-50', 'dark:bg-slate-700', 'text-blue-600', 'dark:text-blue-400');
            link.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-700');
        }
    });
    
    // Render resources for this category
    renderResources();
    
    // Update URL
    history.pushState({category}, '', `#${category}`);
}

// Update filters
function updateFilters() {
    activeFilters = [];
    filterCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            activeFilters.push(checkbox.dataset.filter);
        }
    });
    renderResources();
}

// Perform search
function performSearch(query) {
    if (searchEngine) {
        const results = searchEngine.search(query);
        renderSearchResults(results);
    }
}

// Render search results
function renderSearchResults(results) {
    resourceGrid.innerHTML = '';
    
    if (results.length === 0) {
        resourceGrid.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center py-8 col-span-full">No resources found matching your search.</p>';
        return;
    }
    
    results.forEach(resource => {
        const isFavorite = favorites.includes(resource.id);
        createResourceCard(resource, isFavorite);
    });
    
    // Reinitialize icons
    lucide.createIcons();
}

// Render resources
function renderResources() {
    resourceGrid.innerHTML = '';
    
    let filteredResources = resources;
    
    // Filter by category
    if (currentCategory !== 'dashboard') {
        filteredResources = resources.filter(resource => resource.category === currentCategory);
    }
    
    // Apply active filters
    if (activeFilters.length > 0) {
        filteredResources = filteredResources.filter(resource => {
            return activeFilters.some(filter => {
                if (filter === 'favorites') {
                    return favorites.includes(resource.id);
                }
                return resource.subject.toLowerCase() === filter;
            });
        });
    }
    
    // Render resource cards
    filteredResources.forEach(resource => {
        const isFavorite = favorites.includes(resource.id);
        createResourceCard(resource, isFavorite);
    });
    
    // Reinitialize icons
    lucide.createIcons();
}

// Create a resource card
function createResourceCard(resource, isFavorite) {
    const card = document.createElement('div');
    card.className = 'resource-card bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm';
    card.innerHTML = `
        <div class="h-32 bg-gradient-to-r ${resource.thumbnail}"></div>
        <div class="p-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold">${resource.title}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${resource.subject} • ${resource.type}</p>
                </div>
                <button class="favorite-btn text-slate-400 hover:text-red-500" data-id="${resource.id}">
                    <i data-lucide="${isFavorite ? 'heart' : 'heart'}" class="w-5 h-5 ${isFavorite ? 'fill-current text-red-500' : ''}"></i>
                </button>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-3">
                ${resource.tags.map(tag => `
                    <span class="tag bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded">${tag}</span>
                `).join('')}
            </div>
            
            <div class="flex justify-between items-center mt-4">
                <div class="flex space-x-2">
                    <button class="preview-btn text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg flex items-center" data-id="${resource.id}">
                        <i data-lucide="eye" class="w-4 h-4 mr-1"></i> Preview
                    </button>
                    <button class="download-btn text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg flex items-center" data-id="${resource.id}">
                        <i data-lucide="download" class="w-4 h-4 mr-1"></i> Download
                    </button>
                </div>
                <button class="more-btn text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    <i data-lucide="more-vertical" class="w-5 h-5"></i>
                </button>
            </div>
        </div>
    `;
    resourceGrid.appendChild(card);
}

// View resource
function viewResource(resourceId) {
    const resource = resources.find(r => r.id == resourceId);
    if (!resource) return;
    
    currentResource = resource;
    
    // Update resource viewer
    document.getElementById('resource-thumbnail').className = `h-64 bg-gradient-to-r ${resource.thumbnail} rounded-lg mb-4`;
    document.getElementById('resource-title').textContent = resource.title;
    document.getElementById('resource-description').textContent = resource.description;
    document.getElementById('resource-date').textContent = `Uploaded: ${resource.date}`;
    document.getElementById('resource-type').textContent = `${resource.type} (${resource.size})`;
    
    // Update tags
    const tagsContainer = document.getElementById('resource-tags');
    tagsContainer.innerHTML = '';
    resource.tags.forEach(tag => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-1 rounded';
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
    });
    
    // Show resource viewer
    dashboardView.classList.add('hidden');
    resourceViewer.classList.remove('hidden');
    window.scrollTo(0, 0);
    
    // Render notes for this resource
    renderNotes();
}

// Toggle favorite
async function toggleFavorite(resourceId, button) {
    const index = favorites.indexOf(parseInt(resourceId));
    if (index > -1) {
        // Remove from favorites
        favorites.splice(index, 1);
        button.innerHTML = '<i data-lucide="heart" class="w-5 h-5"></i>';
        await storage.removeFavorite(resourceId);
        notyf.success('Removed from favorites');
    } else {
        // Add to favorites
        favorites.push(parseInt(resourceId));
        button.innerHTML = '<i data-lucide="heart" class="w-5 h-5 fill-current text-red-500"></i>';
        await storage.addFavorite(resourceId);
        notyf.success('Added to favorites');
    }
    
    // Update bookmark count
    updateBookmarkCount();
    
    // Reinitialize icons
    lucide.createIcons();
    
    // Re-render resources if on dashboard
    if (!resourceViewer.classList.contains('hidden')) {
        renderResources();
    }
}

// Update bookmark count
function updateBookmarkCount() {
    bookmarkCount.textContent = favorites.length;
}

// Download resource
async function downloadResource(resourceId) {
    const resource = resources.find(r => r.id == resourceId);
    if (!resource) return;
    
    // Show download manager
    downloadManager.classList.remove('hidden');
    
    // Add to downloads
    const download = {
        id: Date.now(),
        resourceId: resource.id,
        title: resource.title,
        progress: 0
    };
    
    downloads.push(download);
    await storage.addDownload(download);
    renderDownloads();
    
    // Simulate download progress
    const interval = setInterval(async () => {
        download.progress += 5;
        if (download.progress >= 100) {
            download.progress = 100;
            clearInterval(interval);
            await storage.updateDownload(download);
            notyf.success(`Download completed: ${resource.title}`);
        }
        renderDownloads();
    }, 200);
}

// Render downloads
function renderDownloads() {
    downloadsContainer.innerHTML = '';
    
    downloads.forEach(download => {
        const resource = resources.find(r => r.id == download.resourceId);
        if (!resource) return;
        
        const downloadEl = document.createElement('div');
        downloadEl.innerHTML = `
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span>${resource.title}</span>
                    <span>${download.progress}%</span>
                </div>
                <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="progress-bar bg-blue-500" style="width: ${download.progress}%"></div>
                </div>
            </div>
        `;
        downloadsContainer.appendChild(downloadEl);
    });
}

// Preview resource
async function previewResource(resourceId) {
    const resource = resources.find(r => r.id == resourceId);
    if (!resource) return;
    
    // In a real app, this would open the PDF viewer
    try {
        // For demo purposes, we'll just show a notification
        // In a real implementation, we would load the PDF in the viewer
        notyf.success(`Previewing: ${resource.title}`);
        
        // Load PDF in viewer (in a real implementation)
        // await pdfViewer.loadPDF(resource.filePath);
    } catch (error) {
        console.error('Error previewing resource:', error);
        notyf.error('Failed to preview resource');
    }
}

// Save note
async function saveNote(content) {
    if (!currentResource) return;
    
    const note = {
        id: Date.now(),
        resourceId: currentResource.id,
        content: content,
        date: new Date().toLocaleDateString()
    };
    
    if (!notes[currentResource.id]) {
        notes[currentResource.id] = [];
    }
    
    notes[currentResource.id].push(note);
    await storage.addNote(note);
    renderNotes();
}

// Render notes
function renderNotes() {
    notesContainer.innerHTML = '';
    
    if (!currentResource || !notes[currentResource.id]) {
        notesContainer.innerHTML = '<p class="text-slate-500 dark:text-slate-400 text-center py-4">No notes yet. Add your first note above.</p>';
        return;
    }
    
    notes[currentResource.id].forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'p-3 bg-slate-50 dark:bg-slate-700 rounded-lg';
        noteEl.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-500 dark:text-slate-400">${note.date}</span>
                <div class="flex space-x-2">
                    <button class="edit-note text-slate-500 hover:text-blue-600 dark:hover:text-blue-400" data-id="${note.id}">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="delete-note text-slate-500 hover:text-red-600 dark:hover:text-red-400" data-id="${note.id}">
                        <i data-lucide="trash" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <p class="text-sm">${note.content}</p>
        `;
        notesContainer.appendChild(noteEl);
    });
    
    // Reinitialize icons
    lucide.createIcons();
}

// Backup user data
async function backupUserData() {
    try {
        const data = {
            favorites: favorites,
            notes: notes,
            downloads: downloads,
            theme: localStorage.getItem('theme'),
            fontSize: localStorage.getItem('fontSize')
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'qneet-backup.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        notyf.success('Data backup created successfully!');
    } catch (error) {
        console.error('Backup error:', error);
        notyf.error('Failed to create backup');
    }
}

// Restore user data
async function restoreUserData() {
    notyf.warning('Restore functionality would be implemented in a real app');
    // In a real implementation:
    // 1. Create file input element
    // 2. Parse uploaded JSON
    // 3. Restore data to IndexedDB
    // 4. Update UI
}

// Clear user data
async function clearUserData() {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
        try {
            await storage.clearAllData();
            
            favorites = [];
            notes = {};
            downloads = [];
            
            localStorage.removeItem('theme');
            localStorage.removeItem('fontSize');
            
            updateBookmarkCount();
            renderResources();
            renderDownloads();
            renderNotes();
            
            notyf.success('All data cleared successfully!');
        } catch (error) {
            console.error('Clear data error:', error);
            notyf.error('Failed to clear data');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}