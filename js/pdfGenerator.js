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

    addPdfWatermark(pdf) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(Utils.WATERMARK.toUpperCase(), pageWidth / 2, pageHeight - 7, { align: 'center' });
    }

    addCanvasToPdf(pdf, canvas, imgWidth) {
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgData = canvas.toDataURL('image/png', 0.95);

        if (imgHeight <= pageHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            this.addPdfWatermark(pdf);
            return;
        }

        let heightLeft = imgHeight;
        let position = 0;
        let pageIndex = 0;

        while (heightLeft > 0) {
            if (pageIndex > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            if (pageIndex === 0) {
                this.addPdfWatermark(pdf);
            }
            heightLeft -= pageHeight;
            position -= pageHeight;
            pageIndex++;
        }
    }
    
    async generatePDF(formData, templateId) {
        if (!this.jsPDF || !this.html2canvas) {
            throw new Error('Required libraries not loaded');
        }
        
        try {
            const tempContainer = this.createTempContainer();
            const resumeHtml = templateManager.renderTemplate(templateId, formData);
            tempContainer.innerHTML = resumeHtml;
            
            await this.waitForContent(tempContainer);
            
            const pdfOptions = this.getPDFOptions();
            const canvas = await this.html2canvas(tempContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
                logging: false,
                onclone: (clonedDoc) => {
                    const root = clonedDoc.querySelector('.resume-document-root');
                    if (root) {
                        root.style.width = '210mm';
                        root.style.boxSizing = 'border-box';
                    }
                    const watermark = clonedDoc.querySelector('.resume-watermark-first');
                    if (watermark) {
                        watermark.style.display = 'none';
                    }
                }
            });
            
            const pdf = new this.jsPDF(pdfOptions);
            const imgWidth = pdf.internal.pageSize.getWidth();
            this.addCanvasToPdf(pdf, canvas, imgWidth);
            
            const filename = this.generateFilename(formData.personal.fullName);
            pdf.save(filename);
            this.removeTempContainer(tempContainer);
            
            return true;
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            throw error;
        }
    }
    
    createTempContainer() {
        const container = document.createElement('div');
        container.id = 'pdf-temp-container';
        container.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 210mm;
            background: white;
            font-family: 'Inter', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        `;
        
        document.body.appendChild(container);
        return container;
    }
    
    removeTempContainer(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
    
    async waitForContent(container) {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }
        
        const images = container.querySelectorAll('img');
        if (images.length > 0) {
            await Promise.all(Array.from(images).map(img => {
                return new Promise((resolve) => {
                    if (img.complete) resolve();
                    else {
                        img.onload = resolve;
                        img.onerror = resolve;
                    }
                });
            }));
        }
        
        await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    getPDFOptions() {
        return {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
            precision: 2
        };
    }
    
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
            tempContainer.style.width = config.format === 'letter' ? '8.5in' : '210mm';
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
            this.addCanvasToPdf(pdf, canvas, imgWidth);
            
            const filename = config.filename || this.generateFilename(formData.personal.fullName);
            pdf.save(filename);
            
            this.removeTempContainer(tempContainer);
            
            return true;
            
        } catch (error) {
            console.error('Custom PDF generation failed:', error);
            throw error;
        }
    }
    
    isSupported() {
        return !!(this.jsPDF && this.html2canvas);
    }
    
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

const pdfGenerator = new PDFGenerator();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}
