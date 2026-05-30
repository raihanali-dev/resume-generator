/**
 * Main Application Controller
 * Handles navigation, state management, and application initialization
 */

class ResumeBuilderApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.screens = {
            welcome: document.getElementById('welcomeScreen'),
            templates: document.getElementById('templateSelection'),
            form: document.getElementById('resumeForm'),
            preview: document.getElementById('resumePreview')
        };
        
        this.init();
    }
    
    init() {
        this.attachEventListeners();
        this.loadInitialState();
        this.checkLibrariesLoaded();
        
        // Initialize application
        console.log('Resume Builder App initialized');
        
        // Show welcome screen initially
        this.showScreen('welcome');
    }
    
    attachEventListeners() {
        // Get Started button
        document.getElementById('getStartedBtn').addEventListener('click', () => {
            this.navigateToTemplates();
        });
        
        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            this.navigateBack();
        });
        
        // Preview actions
        document.getElementById('editBtn')?.addEventListener('click', () => {
            this.navigateToForm();
        });
        
        document.getElementById('downloadBtn')?.addEventListener('click', () => {
            this.downloadResume();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Window events
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
    }
    
    checkLibrariesLoaded() {
        const status = {
            jsPDF: !!window.jspdf?.jsPDF,
            html2canvas: !!window.html2canvas,
            fontAwesome: !!document.querySelector('link[href*="font-awesome"]'),
            googleFonts: !!document.querySelector('link[href*="fonts.googleapis"]')
        };
        
        console.log('Library status:', status);
        
        // Show warning if critical libraries are missing
        if (!status.jsPDF || !status.html2canvas) {
            Utils.showToast('Some features may not work properly. Please refresh the page.', 'warning', 5000);
        }
        
        return status;
    }
    
    loadInitialState() {
        // Clean up any corrupted localStorage data
        this.cleanupCorruptedStorage();
        
        // Load saved template selection
        templateManager.loadSavedSelection();
        
        // Check if user was in the middle of creating a resume
        const savedData = Utils.storage.get('resumeFormData');
        const savedTemplate = Utils.storage.get('selectedTemplate');
        
        if (savedData && savedTemplate) {
            // Show option to continue or start over
            this.showContinueDialog();
        }
    }
    
    cleanupCorruptedStorage() {
        // Check for corrupted selectedTemplate data
        try {
            const rawTemplate = localStorage.getItem('selectedTemplate');
            if (rawTemplate && !rawTemplate.startsWith('"') && !rawTemplate.startsWith('{')) {
                // This looks like a plain string that should be JSON, fix it
                console.log('Fixing corrupted template storage:', rawTemplate);
                Utils.storage.set('selectedTemplate', rawTemplate);
            }
        } catch (error) {
            console.warn('Cleaning up corrupted localStorage:', error);
            // Remove corrupted data
            localStorage.removeItem('selectedTemplate');
        }
    }
    
    showContinueDialog() {
        const modal = document.createElement('div');
        modal.className = 'continue-modal';
        modal.innerHTML = `
            <div class="continue-modal-content">
                <div class="continue-modal-header">
                    <h3><i class="fas fa-clock"></i> Continue Your Resume?</h3>
                </div>
                <div class="continue-modal-body">
                    <p>We found a saved resume in progress. Would you like to continue where you left off or start fresh?</p>
                </div>
                <div class="continue-modal-footer">
                    <button class="btn btn-secondary" onclick="app.startFresh(); this.closest('.continue-modal').remove();">
                        Start Fresh
                    </button>
                    <button class="btn btn-primary" onclick="app.continueResume(); this.closest('.continue-modal').remove();">
                        Continue Resume
                    </button>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = `
            .continue-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .continue-modal-content {
                background: white;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .continue-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .continue-modal-header h3 {
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .continue-modal-body {
                padding: 1.5rem;
            }
            
            .continue-modal-footer {
                padding: 1.5rem;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                background: #f8fafc;
            }
        `;
        
        if (!document.getElementById('continue-modal-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'continue-modal-styles';
            styleSheet.textContent = modalStyles;
            document.head.appendChild(styleSheet);
        }
        
        document.body.appendChild(modal);
    }
    
    continueResume() {
        const savedTemplate = Utils.storage.get('selectedTemplate');
        if (savedTemplate) {
            templateManager.selectedTemplate = savedTemplate;
            templateManager.updateTemplateSelection();
            this.navigateToForm();
        } else {
            this.navigateToTemplates();
        }
        
        Utils.showToast('Continuing your resume...', 'info');
    }
    
    startFresh() {
        // Clear saved data
        Utils.storage.remove('resumeFormData');
        Utils.storage.remove('selectedTemplate');
        
        // Reset form handler
        if (window.formHandler) {
            formHandler.clearFormData();
        }
        
        // Reset template selection
        templateManager.selectedTemplate = null;
        templateManager.updateTemplateSelection();
        
        Utils.showToast('Starting fresh!', 'info');
    }
    
    navigateToTemplates() {
        this.showScreen('templates');
        this.updateBackButton(true, 'welcome');
        this.updateURL('templates');
    }
    
    navigateToForm() {
        if (!templateManager.getSelectedTemplate()) {
            Utils.showToast('Please select a template first', 'warning');
            this.navigateToTemplates();
            return;
        }
        
        this.showScreen('form');
        this.updateBackButton(true, 'templates');
        this.updateURL('form');
    }
    
    navigateToPreview() {
        if (!templateManager.getSelectedTemplate()) {
            Utils.showToast('Please select a template first', 'warning');
            this.navigateToTemplates();
            return;
        }
        
        const formData = formHandler.getFormData();
        if (!formData.personal.fullName || !formData.personal.email) {
            Utils.showToast('Please fill in at least your name and email', 'warning');
            this.navigateToForm();
            return;
        }
        
        // Render preview
        this.renderPreview(formData);
        
        this.showScreen('preview');
        this.updateBackButton(true, 'form');
        this.updateURL('preview');
    }
    
    navigateBack() {
        const currentScreen = this.currentScreen;
        
        switch (currentScreen) {
            case 'templates':
                this.showScreen('welcome');
                this.updateBackButton(false);
                this.updateURL('');
                break;
            case 'form':
                this.navigateToTemplates();
                break;
            case 'preview':
                this.navigateToForm();
                break;
            default:
                this.showScreen('welcome');
                this.updateBackButton(false);
                this.updateURL('');
        }
    }
    
    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.style.display = 'none';
            }
        });
        
        // Show target screen
        const targetScreen = this.screens[screenName];
        if (targetScreen) {
            targetScreen.style.display = 'block';
            targetScreen.classList.add('fade-in');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                targetScreen.classList.remove('fade-in');
            }, 600);
        }
        
        this.currentScreen = screenName;
        
        // Update page title
        this.updatePageTitle(screenName);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        console.log(`Navigated to: ${screenName}`);
    }
    
    updateBackButton(show, targetScreen = null) {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.style.display = show ? 'flex' : 'none';
            backBtn.dataset.target = targetScreen || '';
        }
    }
    
    updatePageTitle(screenName) {
        const titles = {
            welcome: 'Resume Builder - Create Professional Resumes',
            templates: 'Choose Template - Resume Builder',
            form: 'Build Resume - Resume Builder',
            preview: 'Preview Resume - Resume Builder'
        };
        
        document.title = titles[screenName] || 'Resume Builder';
    }
    
    updateURL(path) {
        const newURL = path ? `${window.location.origin}${window.location.pathname}#${path}` : window.location.pathname;
        window.history.pushState({ screen: path || 'welcome' }, '', newURL);
    }
    
    handlePopState(e) {
        const state = e.state;
        if (state && state.screen) {
            this.showScreen(state.screen);
        } else {
            // Handle direct URL access
            const hash = window.location.hash.slice(1);
            if (hash && this.screens[hash]) {
                this.showScreen(hash);
            } else {
                this.showScreen('welcome');
            }
        }
    }
    
    renderPreview(formData) {
        const previewContent = document.getElementById('previewContent');
        if (!previewContent) return;
        
        const templateId = templateManager.getSelectedTemplate();
        const resumeHtml = templateManager.renderTemplate(templateId, formData);
        
        previewContent.innerHTML = resumeHtml;
        
        // Add print-friendly styles
        previewContent.classList.add('preview-resume');
    }
    
    downloadResume() {
        const formData = formHandler.getFormData();
        const templateId = templateManager.getSelectedTemplate();
        
        if (!templateId) {
            Utils.showToast('No template selected', 'error');
            return;
        }
        
        Utils.showLoading('Generating PDF...');
        
        pdfGenerator.generatePDF(formData, templateId)
            .then(() => {
                Utils.hideLoading();
                Utils.showToast('Resume downloaded successfully!', 'success');
            })
            .catch(error => {
                Utils.hideLoading();
                Utils.showToast('Failed to generate PDF. Please try again.', 'error');
                console.error('PDF generation error:', error);
            });
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S: Save (auto-save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (this.currentScreen === 'form') {
                formHandler.saveFormData();
                Utils.showToast('Form data saved', 'success', 1500);
            }
        }
        
        // Ctrl/Cmd + P: Preview
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            if (this.currentScreen === 'form') {
                this.navigateToPreview();
            }
        }
        
        // Escape: Go back
        if (e.key === 'Escape') {
            if (this.currentScreen !== 'welcome') {
                this.navigateBack();
            }
        }
        
        // Ctrl/Cmd + D: Download PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (this.currentScreen === 'preview') {
                this.downloadResume();
            }
        }
    }
    
    handleBeforeUnload(e) {
        // Only show warning if user has unsaved changes
        if (this.currentScreen === 'form') {
            const formData = formHandler.getFormData();
            if (formData.personal.fullName || formData.personal.email) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        }
    }
    
    // Public API methods
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    getAppState() {
        return {
            currentScreen: this.currentScreen,
            selectedTemplate: templateManager.getSelectedTemplate(),
            hasFormData: !!Utils.storage.get('resumeFormData'),
            libraryStatus: this.checkLibrariesLoaded()
        };
    }
    
    // Error handling
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        
        const userMessage = this.getFriendlyErrorMessage(error);
        Utils.showToast(userMessage, 'error', 5000);
        
        // Report error (could be sent to analytics service)
        this.reportError(error, context);
    }
    
    getFriendlyErrorMessage(error) {
        if (error.message.includes('jsPDF')) {
            return 'PDF generation is not available. Please refresh the page and try again.';
        }
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
            return 'Network error. Please check your connection and try again.';
        }
        
        if (error.message.includes('storage') || error.message.includes('quota')) {
            return 'Storage is full. Please clear some space and try again.';
        }
        
        return 'An unexpected error occurred. Please try again or refresh the page.';
    }
    
    reportError(error, context) {
        // This could send error data to an analytics service
        const errorData = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            appState: this.getAppState()
        };
        
        console.log('Error report:', errorData);
        
        // Example: Send to analytics service
        // analytics.track('error', errorData);
    }
}

// Initialize the application
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new ResumeBuilderApp();
        window.app = app; // Make app globally available
    });
} else {
    app = new ResumeBuilderApp();
    window.app = app; // Make app globally available
}

// Global error handler
window.addEventListener('error', (e) => {
    if (app) {
        app.handleError(e.error || new Error(e.message), 'Global');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    if (app) {
        app.handleError(e.reason || new Error('Unhandled promise rejection'), 'Promise');
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeBuilderApp;
}
