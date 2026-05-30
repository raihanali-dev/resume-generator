/**
 * PDF Generator
 * Handles client-side PDF generation using jsPDF and html2canvas
 */

class PDFGenerator {
    constructor() {
        this.jsPDF = window.jspdf?.jsPDF;
        this.html2canvas = window.html2canvas;
        
        if (!this.jsPDF) {
            console.error('jsPDF library not loaded');
        }
        
        if (!this.html2canvas) {
            console.error('html2canvas library not loaded');
        }
    }
    
    /**
     * Generate PDF from resume data
     * @param {Object} formData - The resume form data
     * @param {string} templateId - The selected template ID
     * @returns {Promise} Promise that resolves when PDF is generated
     */
    async generatePDF(formData, templateId) {
        if (!this.jsPDF || !this.html2canvas) {
            throw new Error('Required libraries not loaded');
        }
        
        try {
            // Create temporary container for PDF generation
            const tempContainer = this.createTempContainer();
            
            // Render resume in the temporary container
            const resumeHtml = templateManager.renderTemplate(templateId, formData);
            tempContainer.innerHTML = resumeHtml;
            
            // Wait for fonts and images to load
            await this.waitForContent(tempContainer);
            
            // Configure PDF options
            const pdfOptions = this.getPDFOptions();
            
            // Generate PDF using html2canvas + jsPDF
            const canvas = await this.html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
                onclone: (clonedDoc) => {
                    // Ensure proper styling in cloned document
                    const clonedElement = clonedDoc.body.firstChild;
                    if (clonedElement) {
                        clonedElement.style.width = '210mm';
                        clonedElement.style.minHeight = '297mm';
                        clonedElement.style.padding = '20mm';
                        clonedElement.style.boxSizing = 'border-box';
                        clonedElement.style.fontSize = '12pt';
                        clonedElement.style.lineHeight = '1.4';
                    }
                }
            });
            
            // Create PDF
            const pdf = new this.jsPDF(pdfOptions);
            
            // Calculate dimensions
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');
            
            if (imgHeight <= pageHeight) {
                // Single page
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                // Multiple pages
                let heightLeft = imgHeight;
                let position = 0;
                
                // First page
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Additional pages
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            }
            
            // Generate filename
            const filename = this.generateFilename(formData.personal.fullName);
            
            // Download PDF
            pdf.save(filename);
            
            // Clean up
            this.removeTempContainer(tempContainer);
            
            return true;
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Create temporary container for PDF generation
     * @returns {HTMLElement} The temporary container element
     */
    createTempContainer() {
        const container = document.createElement('div');
        container.id = 'pdf-temp-container';
        container.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 210mm;
            min-height: 297mm;
            background: white;
            font-family: 'Inter', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        `;
        
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * Remove temporary container
     * @param {HTMLElement} container - The container to remove
     */
    removeTempContainer(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
    
    /**
     * Wait for content to load (fonts, images, etc.)
     * @param {HTMLElement} container - The container to wait for
     * @returns {Promise} Promise that resolves when content is loaded
     */
    async waitForContent(container) {
        // Wait for fonts to load
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        
        // Wait for images to load
        const images = container.querySelectorAll('img');
        if (images.length > 0) {
            const imagePromises = Array.from(images).map(img => {
                return new Promise((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.onload = resolve;
                        img.onerror = resolve; // Resolve even on error to not block
                    }
                });
            });
            
            await Promise.all(imagePromises);
        }
        
        // Additional delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    /**
     * Get PDF configuration options
     * @returns {Object} PDF options
     */
    getPDFOptions() {
        return {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 2
        };
    }
    
    /**
     * Generate filename for the PDF
     * @param {string} fullName - The person's full name
     * @returns {string} The generated filename
     */
    generateFilename(fullName) {
        const cleanName = fullName.trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .toLowerCase();
        
        const timestamp = new Date().toISOString().slice(0, 10);
        
        return cleanName 
            ? `${cleanName}_resume_${timestamp}.pdf`
            : `resume_${timestamp}.pdf`;
    }
    
    /**
     * Preview PDF in new window (for testing)
     * @param {Object} formData - The resume form data
     * @param {string} templateId - The selected template ID
     */
    async previewPDF(formData, templateId) {
        try {
            const tempContainer = this.createTempContainer();
            const resumeHtml = templateManager.renderTemplate(templateId, formData);
            tempContainer.innerHTML = resumeHtml;
            
            await this.waitForContent(tempContainer);
            
            const canvas = await this.html2canvas(tempContainer, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            // Create new window with canvas
            const newWindow = window.open('', '_blank');
            newWindow.document.write(`
                <html>
                    <head>
                        <title>Resume Preview</title>
                        <style>
                            body { margin: 0; padding: 20px; background: #f5f5f5; }
                            canvas { max-width: 100%; height: auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                        </style>
                    </head>
                    <body>
                        <h2>Resume Preview</h2>
                        ${canvas.outerHTML}
                    </body>
                </html>
            `);
            
            this.removeTempContainer(tempContainer);
            
        } catch (error) {
            console.error('PDF preview failed:', error);
            Utils.showToast('Preview failed. Please try again.', 'error');
        }
    }
    
    /**
     * Generate PDF with custom options
     * @param {Object} formData - The resume form data
     * @param {string} templateId - The selected template ID
     * @param {Object} options - Custom options
     * @returns {Promise} Promise that resolves when PDF is generated
     */
    async generateCustomPDF(formData, templateId, options = {}) {
        const defaultOptions = {
            filename: null,
            format: 'a4',
            orientation: 'portrait',
            quality: 2,
            margin: 20
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const tempContainer = this.createTempContainer();
            
            // Apply custom styling
            tempContainer.style.width = config.format === 'letter' ? '8.5in' : '210mm';
            tempContainer.style.minHeight = config.format === 'letter' ? '11in' : '297mm';
            tempContainer.style.padding = `${config.margin}mm`;
            
            const resumeHtml = templateManager.renderTemplate(templateId, formData);
            tempContainer.innerHTML = resumeHtml;
            
            await this.waitForContent(tempContainer);
            
            const canvas = await this.html2canvas(tempContainer, {
                scale: config.quality,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight
            });
            
            const pdf = new this.jsPDF({
                orientation: config.orientation,
                unit: 'mm',
                format: config.format,
                compress: true
            });
            
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const imgData = canvas.toDataURL('image/png');
            
            if (imgHeight <= pageHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                let heightLeft = imgHeight;
                let position = 0;
                
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            }
            
            const filename = config.filename || this.generateFilename(formData.personal.fullName);
            pdf.save(filename);
            
            this.removeTempContainer(tempContainer);
            
            return true;
            
        } catch (error) {
            console.error('Custom PDF generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Check if PDF generation is supported
     * @returns {boolean} Whether PDF generation is supported
     */
    isSupported() {
        return !!(this.jsPDF && this.html2canvas);
    }
    
    /**
     * Get PDF generation status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            supported: this.isSupported(),
            jsPDF: !!this.jsPDF,
            html2canvas: !!this.html2canvas,
            version: {
                jsPDF: this.jsPDF ? '2.5.1' : 'Not loaded',
                html2canvas: this.html2canvas ? '1.4.1' : 'Not loaded'
            }
        };
    }
}

// Initialize PDF generator
const pdfGenerator = new PDFGenerator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
