// js/pdf-viewer.js

/**
 * PDF Viewer Class for QNEET
 * Integrates with PDF.js to render PDF documents
 */
export class PDFViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.pdfDoc = null;
        this.currentPage = 1;
        this.scale = 1.5;
        this.canvas = null;
        this.context = null;
        this.isRendering = false;
        this.pageRenderingQueue = null;
        
        // Create navigation controls
        this.createNavigationControls();
        
        // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }
    
    /**
     * Create navigation controls for the PDF viewer
     */
    createNavigationControls() {
        // Create controls container
        const controls = document.createElement('div');
        controls.className = 'pdf-controls flex items-center justify-between p-3 bg-white dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600';
        controls.id = 'pdf-controls';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pdf-prev bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center';
        prevButton.innerHTML = '<i data-lucide="chevron-left" class="w-5 h-5"></i> Previous';
        prevButton.addEventListener('click', () => this.previousPage());
        
        // Page info
        const pageInfo = document.createElement('div');
        pageInfo.className = 'pdf-page-info text-slate-600 dark:text-slate-300';
        pageInfo.id = 'pdf-page-info';
        pageInfo.textContent = 'Page 1 of 1';
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pdf-next bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg flex items-center';
        nextButton.innerHTML = 'Next <i data-lucide="chevron-right" class="w-5 h-5"></i>';
        nextButton.addEventListener('click', () => this.nextPage());
        
        // Zoom controls
        const zoomControls = document.createElement('div');
        zoomControls.className = 'flex items-center space-x-2';
        
        const zoomOutButton = document.createElement('button');
        zoomOutButton.className = 'pdf-zoom-out bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 p-2 rounded-lg';
        zoomOutButton.innerHTML = '<i data-lucide="zoom-out" class="w-5 h-5"></i>';
        zoomOutButton.addEventListener('click', () => this.zoomOut());
        
        const zoomInButton = document.createElement('button');
        zoomInButton.className = 'pdf-zoom-in bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 p-2 rounded-lg';
        zoomInButton.innerHTML = '<i data-lucide="zoom-in" class="w-5 h-5"></i>';
        zoomInButton.addEventListener('click', () => this.zoomIn());
        
        zoomControls.appendChild(zoomOutButton);
        zoomControls.appendChild(zoomInButton);
        
        // Assemble controls
        controls.appendChild(prevButton);
        controls.appendChild(pageInfo);
        controls.appendChild(nextButton);
        controls.appendChild(zoomControls);
        
        // Insert controls after the container
        this.container.parentNode.insertBefore(controls, this.container.nextSibling);
        
        // Store references
        this.prevButton = prevButton;
        this.nextButton = nextButton;
        this.pageInfo = pageInfo;
    }
    
    /**
     * Load a PDF document from a URL
     * @param {string} url - URL to the PDF file
     */
    async loadPDF(url) {
        try {
            // Show loading indicator
            this.showLoading();
            
            // Load the PDF document
            const loadingTask = pdfjsLib.getDocument(url);
            
            // Add progress tracking
            loadingTask.onProgress = (progress) => {
                this.updateLoadingProgress(progress.loaded / progress.total);
            };
            
            this.pdfDoc = await loadingTask.promise;
            
            // Hide loading indicator
            this.hideLoading();
            
            // Render the first page
            this.currentPage = 1;
            await this.renderPage(this.currentPage);
            
            // Update navigation controls
            this.updateNavigationControls();
            
            console.log(`PDF loaded: ${this.pdfDoc.numPages} pages`);
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Failed to load PDF document');
        }
    }
    
    /**
     * Render a specific page of the PDF
     * @param {number} pageNum - Page number to render
     */
    async renderPage(pageNum) {
        if (!this.pdfDoc || this.isRendering) {
            return;
        }
        
        this.isRendering = true;
        
        try {
            // Get the page
            const page = await this.pdfDoc.getPage(pageNum);
            
            // Set viewport
            const viewport = page.getViewport({ scale: this.scale });
            
            // Prepare canvas
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.context = this.canvas.getContext('2d');
                this.container.innerHTML = '';
                this.container.appendChild(this.canvas);
            }
            
            // Set canvas dimensions
            this.canvas.height = viewport.height;
            this.canvas.width = viewport.width;
            
            // Render the page
            const renderContext = {
                canvasContext: this.context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update page info
            this.updatePageInfo();
        } catch (error) {
            console.error('Error rendering page:', error);
            this.showError('Failed to render page');
        } finally {
            this.isRendering = false;
            
            // Check if another page was queued
            if (this.pageRenderingQueue !== null && this.pageRenderingQueue !== this.currentPage) {
                const pageNum = this.pageRenderingQueue;
                this.pageRenderingQueue = null;
                this.renderPage(pageNum);
            }
        }
    }
    
    /**
     * Queue a page for rendering
     * @param {number} pageNum - Page number to render
     */
    queueRenderPage(pageNum) {
        if (this.isRendering) {
            this.pageRenderingQueue = pageNum;
        } else {
            this.renderPage(pageNum);
        }
    }
    
    /**
     * Go to the previous page
     */
    previousPage() {
        if (this.currentPage <= 1) return;
        
        this.currentPage--;
        this.queueRenderPage(this.currentPage);
        this.updateNavigationControls();
    }
    
    /**
     * Go to the next page
     */
    nextPage() {
        if (this.currentPage >= this.pdfDoc.numPages) return;
        
        this.currentPage++;
        this.queueRenderPage(this.currentPage);
        this.updateNavigationControls();
    }
    
    /**
     * Go to a specific page
     * @param {number} pageNum - Page number to go to
     */
    goToPage(pageNum) {
        if (pageNum < 1 || pageNum > this.pdfDoc.numPages) return;
        
        this.currentPage = pageNum;
        this.queueRenderPage(this.currentPage);
        this.updateNavigationControls();
    }
    
    /**
     * Zoom in on the PDF
     */
    zoomIn() {
        this.scale += 0.2;
        this.queueRenderPage(this.currentPage);
    }
    
    /**
     * Zoom out on the PDF
     */
    zoomOut() {
        if (this.scale <= 0.5) return;
        this.scale -= 0.2;
        this.queueRenderPage(this.currentPage);
    }
    
    /**
     * Update navigation controls based on current state
     */
    updateNavigationControls() {
        if (!this.pdfDoc) return;
        
        // Update button states
        this.prevButton.disabled = this.currentPage <= 1;
        this.nextButton.disabled = this.currentPage >= this.pdfDoc.numPages;
        
        // Update page info
        this.updatePageInfo();
    }
    
    /**
     * Update page information display
     */
    updatePageInfo() {
        if (!this.pdfDoc) return;
        this.pageInfo.textContent = `Page ${this.currentPage} of ${this.pdfDoc.numPages}`;
    }
    
    /**
     * Show loading indicator
     */
    showLoading() {
        this.container.innerHTML = `
            <div class="pdf-loading flex flex-col items-center justify-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p class="text-slate-600 dark:text-slate-300">Loading PDF...</p>
                <div class="w-64 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                    <div class="loading-progress h-full bg-blue-500 w-0 transition-all duration-300"></div>
                </div>
            </div>
        `;
        this.loadingProgress = this.container.querySelector('.loading-progress');
    }
    
    /**
     * Update loading progress
     * @param {number} progress - Progress value between 0 and 1
     */
    updateLoadingProgress(progress) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${progress * 100}%`;
        }
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        // Loading indicator will be replaced when PDF renders
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="pdf-error flex flex-col items-center justify-center h-full p-6 text-center">
                <i data-lucide="alert-circle" class="w-16 h-16 text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold mb-2">Error Loading PDF</h3>
                <p class="text-slate-600 dark:text-slate-300 mb-4">${message}</p>
                <button class="retry-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Try Again
                </button>
            </div>
        `;
        
        // Add retry functionality
        const retryButton = this.container.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                // In a real implementation, this would retry loading the PDF
                // For demo purposes, we'll just show an alert
                alert('In a real implementation, this would retry loading the PDF');
            });
        }
        
        // Reinitialize icons
        lucide.createIcons();
    }
    
    /**
     * Search for text in the PDF
     * @param {string} query - Text to search for
     */
    async searchText(query) {
        if (!this.pdfDoc) return [];
        
        const results = [];
        
        // Search through all pages
        for (let i = 1; i <= this.pdfDoc.numPages; i++) {
            const page = await this.pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            
            // Simple search implementation
            const pageText = textContent.items.map(item => item.str).join(' ');
            if (pageText.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                    page: i,
                    text: pageText.substring(0, 100) + '...'
                });
            }
        }
        
        return results;
    }
    
    /**
     * Print the current PDF
     */
    print() {
        if (!this.pdfDoc) return;
        
        // In a real implementation, this would open the browser print dialog
        // For demo purposes, we'll just show an alert
        alert('In a real implementation, this would open the browser print dialog');
    }
    
    /**
     * Download the current PDF
     */
    download() {
        if (!this.pdfDoc) return;
        
        // In a real implementation, this would trigger a file download
        // For demo purposes, we'll just show an alert
        alert('In a real implementation, this would trigger a file download');
    }
    
    /**
     * Destroy the PDF viewer and clean up resources
     */
    destroy() {
        if (this.pdfDoc) {
            this.pdfDoc.destroy();
            this.pdfDoc = null;
        }
        
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            this.context = null;
        }
        
        // Remove controls
        const controls = document.getElementById('pdf-controls');
        if (controls) {
            controls.remove();
        }
    }
}

// Export the class as default
export default PDFViewer;