/**
 * Template Management System
 * Handles template selection, rendering, and preview functionality
 */

class TemplateManager {
    constructor() {
        this.templates = {
            modern: {
                id: 'modern',
                name: 'Modern Professional',
                description: 'Clean and contemporary design with gradient header and modern typography. Perfect for tech and creative professionals.',
                features: ['Gradient Header', 'Clean Layout', 'Modern Typography', 'Skills Grid'],
                preview: 'modern-preview.svg',
                className: 'template-modern'
            },
            classic: {
                id: 'classic',
                name: 'Classic Traditional',
                description: 'Timeless and professional design with traditional formatting. Ideal for corporate and formal industries.',
                features: ['Traditional Layout', 'Professional Typography', 'Clean Sections', 'Formal Style'],
                preview: 'classic-preview.svg',
                className: 'template-classic'
            },
            minimal: {
                id: 'minimal',
                name: 'Minimal Clean',
                description: 'Simple and elegant design focused on content. Great for any industry with emphasis on readability.',
                features: ['Minimal Design', 'Content Focus', 'Clean Typography', 'Spacious Layout'],
                preview: 'minimal-preview.svg',
                className: 'template-minimal'
            },
            executive: {
                id: 'executive',
                name: 'Executive Sidebar',
                description: 'Sophisticated two-column layout with a dark sidebar. Ideal for senior roles and leadership positions.',
                features: ['Sidebar Layout', 'Gold Accents', 'Skills Highlight', 'Executive Feel'],
                preview: 'executive-preview.svg',
                className: 'template-executive'
            },
            creative: {
                id: 'creative',
                name: 'Creative Timeline',
                description: 'Bold timeline design with vibrant accents. Perfect for designers, marketers, and creative professionals.',
                features: ['Timeline Layout', 'Bold Colors', 'Tag Skills', 'Visual Impact'],
                preview: 'creative-preview.svg',
                className: 'template-creative'
            }
        };
        
        this.selectedTemplate = null;
        this.init();
    }

    esc(value) {
        return Utils.sanitizeHtml(String(value ?? ''));
    }
    
    init() {
        this.renderTemplateGrid();
        this.attachEventListeners();
    }
    
    renderTemplateGrid() {
        const grid = document.getElementById('templateGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        Object.values(this.templates).forEach(template => {
            const templateCard = this.createTemplateCard(template);
            grid.appendChild(templateCard);
        });
    }
    
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.templateId = template.id;
        
        card.innerHTML = `
            <div class="template-preview">
                ${this.createPreviewPlaceholder(template)}
            </div>
            <div class="template-info">
                <h3 class="template-title">${template.name}</h3>
                <p class="template-description">${template.description}</p>
                <div class="template-features">
                    ${template.features.map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                </div>
                <div class="template-actions">
                    <button class="btn-select" data-template-id="${template.id}">
                        Select Template
                    </button>
                    <button class="btn-preview" data-template-id="${template.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    createPreviewPlaceholder(template) {
        const previews = {
            classic: `<div class="template-preview-placeholder preview-classic">
                <div class="preview-header classic"></div>
                <div class="preview-line"></div><div class="preview-line short"></div>
                <div class="preview-section"><div class="preview-section-title"></div><div class="preview-line medium"></div></div>
            </div>`,
            minimal: `<div class="template-preview-placeholder preview-minimal">
                <div class="preview-header minimal"></div>
                <div class="preview-line"></div><div class="preview-line short"></div>
                <div class="preview-section"><div class="preview-section-title"></div><div class="preview-line"></div></div>
            </div>`,
            executive: `<div class="template-preview-placeholder preview-executive">
                <div class="preview-exec-sidebar"><div class="preview-line short"></div><div class="preview-line"></div><div class="preview-line medium"></div></div>
                <div class="preview-exec-main"><div class="preview-section-title"></div><div class="preview-line"></div><div class="preview-line medium"></div></div>
            </div>`,
            creative: `<div class="template-preview-placeholder preview-creative">
                <div class="preview-creative-bar"></div>
                <div class="preview-header creative"></div>
                <div class="preview-timeline"><div class="preview-dot"></div><div class="preview-line medium"></div></div>
                <div class="preview-timeline"><div class="preview-dot"></div><div class="preview-line short"></div></div>
            </div>`
        };

        if (previews[template.id]) return previews[template.id];

        return `<div class="template-preview-placeholder">
            <div class="preview-header"></div>
            <div class="preview-line"></div><div class="preview-line short"></div>
            <div class="preview-section"><div class="preview-section-title"></div><div class="preview-line medium"></div><div class="preview-line"></div></div>
        </div>`;
    }
    
    attachEventListeners() {
        // Template selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-select')) {
                const templateId = e.target.dataset.templateId;
                this.selectTemplate(templateId);
            }
            
            if (e.target.classList.contains('btn-preview') || e.target.closest('.btn-preview')) {
                const templateId = e.target.dataset.templateId || e.target.closest('.btn-preview').dataset.templateId;
                this.previewTemplate(templateId);
            }
        });
        
        // Template card selection
        document.addEventListener('click', (e) => {
            const templateCard = e.target.closest('.template-card');
            if (templateCard && !e.target.closest('.template-actions')) {
                const templateId = templateCard.dataset.templateId;
                this.selectTemplate(templateId);
            }
        });
    }
    
    selectTemplate(templateId) {
        if (!this.templates[templateId]) return;
        
        // Update selected template
        this.selectedTemplate = templateId;
        
        // Update UI
        this.updateTemplateSelection();
        
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selecting'));
        const card = document.querySelector(`.template-card[data-template-id="${templateId}"]`);
        card?.classList.add('selecting');
        
        Utils.storage.set('selectedTemplate', templateId);
        Utils.showToast(`${this.templates[templateId].name} selected`, 'success', 1500);
        
        setTimeout(() => {
            if (window.app && typeof window.app.navigateToForm === 'function') {
                window.app.navigateToForm();
            }
        }, 350);
        
        console.log(`Template selected: ${this.templates[templateId].name}`);
    }
    
    updateTemplateSelection() {
        // Remove previous selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to current template
        if (this.selectedTemplate) {
            const selectedCard = document.querySelector(`.template-card[data-template-id="${this.selectedTemplate}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
        }
    }
    
    previewTemplate(templateId) {
        if (!this.templates[templateId]) return;
        
        // Create sample data for preview
        const sampleData = this.getSampleData();
        
        // Render preview
        const previewHtml = this.renderTemplate(templateId, sampleData);
        
        // Show preview modal or navigate to preview
        this.showPreviewModal(previewHtml, this.templates[templateId].name, templateId);
    }
    
    getSampleData() {
        return {
            personal: {
                fullName: 'John Doe',
                email: 'john.doe@email.com',
                phone: '+1 (555) 123-4567',
                location: 'New York, NY',
                website: 'https://johndoe.com',
                linkedin: 'https://linkedin.com/in/johndoe',
                summary: 'Experienced software developer with 5+ years of expertise in full-stack development, specializing in modern web technologies and agile methodologies.'
            },
            experience: [
                {
                    title: 'Senior Software Developer',
                    company: 'Tech Solutions Inc.',
                    location: 'New York, NY',
                    startDate: '2021-01',
                    endDate: 'Present',
                    current: true,
                    description: 'Led development of scalable web applications using React, Node.js, and AWS. Managed a team of 4 developers and improved system performance by 40%.'
                },
                {
                    title: 'Software Developer',
                    company: 'StartupXYZ',
                    location: 'San Francisco, CA',
                    startDate: '2019-06',
                    endDate: '2020-12',
                    current: false,
                    description: 'Developed and maintained full-stack applications. Collaborated with cross-functional teams to deliver high-quality software solutions.'
                }
            ],
            education: [
                {
                    degree: 'Bachelor of Science in Computer Science',
                    school: 'University of Technology',
                    location: 'Boston, MA',
                    startDate: '2015-09',
                    endDate: '2019-05',
                    gpa: '3.8',
                    description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems'
                }
            ],
            skills: [
                { name: 'JavaScript', level: 'Expert' },
                { name: 'React', level: 'Expert' },
                { name: 'Node.js', level: 'Advanced' },
                { name: 'Python', level: 'Advanced' },
                { name: 'AWS', level: 'Intermediate' },
                { name: 'Docker', level: 'Intermediate' }
            ]
        };
    }
    
    showPreviewModal(previewHtml, templateName, templateId) {
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-modal-header">
                    <h3>Preview: ${this.esc(templateName)}</h3>
                    <button class="btn-close" aria-label="Close preview">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-modal-body">
                    ${previewHtml}
                </div>
                <div class="preview-modal-footer">
                    <button class="btn btn-secondary" data-action="close">Close</button>
                    <button class="btn btn-primary" data-action="select" data-template-id="${templateId}">
                        Select This Template
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();

        modal.querySelector('.btn-close').addEventListener('click', closeModal);
        modal.querySelector('[data-action="close"]').addEventListener('click', closeModal);
        modal.querySelector('[data-action="select"]').addEventListener('click', (e) => {
            this.selectTemplate(e.target.dataset.templateId);
            closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    renderTemplate(templateId, data) {
        const template = this.templates[templateId];
        if (!template) return '';
        
        let html;
        switch (templateId) {
            case 'modern':
                html = this.renderModernTemplate(data);
                break;
            case 'classic':
                html = this.renderClassicTemplate(data);
                break;
            case 'minimal':
                html = this.renderMinimalTemplate(data);
                break;
            case 'executive':
                html = this.renderExecutiveTemplate(data);
                break;
            case 'creative':
                html = this.renderCreativeTemplate(data);
                break;
            default:
                html = this.renderModernTemplate(data);
        }

        return this.wrapWithWatermark(html);
    }

    wrapWithWatermark(html) {
        return `<div class="resume-document-root">${html}${Utils.getWatermarkHtml()}</div>`;
    }
    
    renderModernTemplate(data) {
        const { personal, experience, education, skills } = data;
        const e = (v) => this.esc(v);
        const certifications = data.certifications || [];
        const achievements = data.achievements || [];
        const activities = data.activities || [];
        const languages = data.languages || [];
        const projects = data.projects || [];
        
        return `
            <div class="template-modern">
                <div class="resume-header">
                    <h1 class="resume-name">${e(personal.fullName)}</h1>
                    <div class="resume-contact">
                        ${personal.email ? `<span><i class="fas fa-envelope"></i> ${e(personal.email)}</span>` : ''}
                        ${personal.phone ? `<span><i class="fas fa-phone"></i> ${e(personal.phone)}</span>` : ''}
                        ${personal.location ? `<span><i class="fas fa-map-marker-alt"></i> ${e(personal.location)}</span>` : ''}
                        ${personal.website ? `<span><i class="fas fa-globe"></i> ${e(personal.website)}</span>` : ''}
                        ${personal.linkedin ? `<span><i class="fab fa-linkedin"></i> LinkedIn</span>` : ''}
                    </div>
                </div>
                
                <div class="resume-body">
                    ${personal.summary ? `
                        <div class="resume-section">
                            <h2 class="section-title">Professional Summary</h2>
                            <p>${e(personal.summary)}</p>
                        </div>
                    ` : ''}
                    
                    ${experience.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Experience</h2>
                            ${experience.map(exp => `
                                <div class="experience-item">
                                    <div class="item-header">
                                        <div>
                                            <div class="item-title">${e(exp.title)}</div>
                                            <div class="item-company">${e(exp.company)}${exp.location ? `, ${e(exp.location)}` : ''}</div>
                                        </div>
                                        <div class="item-date">
                                            ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}
                                        </div>
                                    </div>
                                    ${exp.description ? `<p>${e(exp.description)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${education.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Education</h2>
                            ${education.map(edu => `
                                <div class="education-item">
                                    <div class="item-header">
                                        <div>
                                            <div class="item-title">${e(edu.degree)}</div>
                                            <div class="item-company">${e(edu.school)}${edu.location ? `, ${e(edu.location)}` : ''}</div>
                                        </div>
                                        <div class="item-date">
                                            ${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}
                                        </div>
                                    </div>
                                    ${edu.gpa ? `<p>GPA: ${e(edu.gpa)}</p>` : ''}
                                    ${edu.description ? `<p>${e(edu.description)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${skills.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Skills</h2>
                            <div class="skills-grid">
                                ${skills.map(skill => `
                                    <div class="skill-item">
                                        <strong>${e(skill.name)}</strong>
                                        ${skill.level ? ` - ${e(skill.level)}` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${projects.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Projects</h2>
                            ${projects.map(p => `
                                <div class="list-item">
                                    <div class="item-header">
                                        <div>
                                            <div class="item-title">${e(p.title)}</div>
                                            ${p.role ? `<div class="item-company">${e(p.role)}</div>` : ''}
                                        </div>
                                        <div class="item-date">${e(p.duration || '')}</div>
                                    </div>
                                    ${p.description ? `<p>${e(p.description)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${certifications.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Certifications</h2>
                            ${certifications.map(c => `
                                <div class="list-item">
                                    <div class="item-header">
                                        <div class="item-title">${e(c.name)}</div>
                                        <div class="item-date">${e(c.year || '')}</div>
                                    </div>
                                    ${c.issuer ? `<p>Issuer: ${e(c.issuer)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${achievements.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Achievements</h2>
                            ${achievements.map(a => `
                                <div class="list-item">
                                    <div class="item-title">${e(a.title)}</div>
                                    ${a.description ? `<p>${e(a.description)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${activities.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Extracurricular Activities</h2>
                            ${activities.map(a => `
                                <div class="list-item">
                                    <div class="item-title">${e(a.title)}</div>
                                    ${a.description ? `<p>${e(a.description)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${languages.length > 0 ? `
                        <div class="resume-section">
                            <h2 class="section-title">Languages</h2>
                            <div class="skills-grid">
                                ${languages.map(l => `
                                    <div class="skill-item"><strong>${e(l.name)}</strong>${l.proficiency ? ` - ${e(l.proficiency)}` : ''}</div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderClassicTemplate(data) {
        const { personal, experience, education, skills } = data;
        const e = (v) => this.esc(v);
        const certifications = data.certifications || [];
        const achievements = data.achievements || [];
        const activities = data.activities || [];
        const languages = data.languages || [];
        const projects = data.projects || [];
        
        return `
            <div class="template-classic">
                <div class="resume-header">
                    <h1 class="resume-name">${e(personal.fullName)}</h1>
                    <div class="resume-contact">
                        ${personal.email ? `<span>${e(personal.email)}</span>` : ''}
                        ${personal.phone ? `<span>${e(personal.phone)}</span>` : ''}
                        ${personal.location ? `<span>${e(personal.location)}</span>` : ''}
                        ${personal.website ? `<span>${e(personal.website)}</span>` : ''}
                    </div>
                </div>
                
                ${personal.summary ? `
                    <div class="resume-section">
                        <h2 class="section-title">Summary</h2>
                        <p>${e(personal.summary)}</p>
                    </div>
                ` : ''}
                
                ${experience.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Experience</h2>
                        ${experience.map(exp => `
                            <div class="experience-item">
                                <div class="item-header">
                                    <span class="item-title">${e(exp.title)}</span>
                                    <span class="item-company">${e(exp.company)}</span>
                                    <span class="item-date">
                                        ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}
                                    </span>
                                </div>
                                ${exp.description ? `<p>${e(exp.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${education.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Education</h2>
                        ${education.map(edu => `
                            <div class="education-item">
                                <div class="item-header">
                                    <span class="item-title">${e(edu.degree)}</span>
                                    <span class="item-company">${e(edu.school)}</span>
                                    <span class="item-date">
                                        ${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}
                                    </span>
                                </div>
                                ${edu.gpa ? `<p>GPA: ${e(edu.gpa)}</p>` : ''}
                                ${edu.description ? `<p>${e(edu.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${skills.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Skills</h2>
                        <div class="skills-list">
                            ${skills.map(skill => `
                                <div class="skill-item">${e(skill.name)}${skill.level ? ` (${e(skill.level)})` : ''}</div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${projects.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Projects</h2>
                        ${projects.map(p => `
                            <div class="list-item">
                                <span class="item-title">${e(p.title)}</span>
                                ${p.role ? ` - ${e(p.role)}` : ''}
                                ${p.duration ? ` <span class="item-date">(${e(p.duration)})</span>` : ''}
                                ${p.description ? `<div><small>${e(p.description)}</small></div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${certifications.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Certifications</h2>
                        ${certifications.map(c => `
                            <div class="list-item"><span class="item-title">${e(c.name)}</span>${c.year ? ` - ${e(c.year)}` : ''}${c.issuer ? `, ${e(c.issuer)}` : ''}</div>
                        `).join('')}
                    </div>
                ` : ''}
                ${achievements.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Achievements</h2>
                        ${achievements.map(a => `
                            <div class="list-item"><span class="item-title">${e(a.title)}</span>${a.description ? ` - ${e(a.description)}` : ''}</div>
                        `).join('')}
                    </div>
                ` : ''}
                ${activities.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Extracurricular Activities</h2>
                        ${activities.map(a => `
                            <div class="list-item"><span class="item-title">${e(a.title)}</span>${a.description ? ` - ${e(a.description)}` : ''}</div>
                        `).join('')}
                    </div>
                ` : ''}
                ${languages.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Languages</h2>
                        <div class="skills-list">
                            ${languages.map(l => `<div class="skill-item">${e(l.name)}${l.proficiency ? ` (${e(l.proficiency)})` : ''}</div>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderMinimalTemplate(data) {
        const { personal, experience, education, skills } = data;
        const e = (v) => this.esc(v);
        const certifications = data.certifications || [];
        const achievements = data.achievements || [];
        const activities = data.activities || [];
        const languages = data.languages || [];
        const projects = data.projects || [];
        
        return `
            <div class="template-minimal">
                <div class="resume-header">
                    <h1 class="resume-name">${e(personal.fullName)}</h1>
                    <div class="resume-contact">
                        ${personal.email ? `<span>${e(personal.email)}</span>` : ''}
                        ${personal.phone ? `<span>${e(personal.phone)}</span>` : ''}
                        ${personal.location ? `<span>${e(personal.location)}</span>` : ''}
                        ${personal.website ? `<span>${e(personal.website)}</span>` : ''}
                    </div>
                </div>
                
                ${personal.summary ? `
                    <div class="resume-section">
                        <h2 class="section-title">About</h2>
                        <p>${e(personal.summary)}</p>
                    </div>
                ` : ''}
                
                ${experience.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Experience</h2>
                        ${experience.map(exp => `
                            <div class="experience-item">
                                <div class="item-title">${e(exp.title)}</div>
                                <div class="item-company">${e(exp.company)}${exp.location ? `, ${e(exp.location)}` : ''}</div>
                                <div class="item-date">
                                    ${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}
                                </div>
                                ${exp.description ? `<p>${e(exp.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${education.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Education</h2>
                        ${education.map(edu => `
                            <div class="education-item">
                                <div class="item-title">${e(edu.degree)}</div>
                                <div class="item-company">${e(edu.school)}${edu.location ? `, ${e(edu.location)}` : ''}</div>
                                <div class="item-date">
                                    ${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}
                                </div>
                                ${edu.gpa ? `<p>GPA: ${e(edu.gpa)}</p>` : ''}
                                ${edu.description ? `<p>${e(edu.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${skills.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Skills</h2>
                        <div class="skills-grid">
                            ${skills.map(skill => `
                                <span class="skill-item">${e(skill.name)}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${projects.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Projects</h2>
                        ${projects.map(p => `
                            <div class="list-item">
                                <div class="item-title">${e(p.title)}</div>
                                ${p.role ? `<div class="item-company">${e(p.role)}</div>` : ''}
                                ${p.duration ? `<div class="item-date">${e(p.duration)}</div>` : ''}
                                ${p.description ? `<p>${e(p.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${certifications.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Certifications</h2>
                        ${certifications.map(c => `
                            <div class="list-item">
                                <div class="item-title">${e(c.name)}</div>
                                ${c.year || c.issuer ? `<div class="item-company">${[c.year, c.issuer].filter(Boolean).map(v => e(v)).join(' - ')}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${achievements.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Achievements</h2>
                        ${achievements.map(a => `
                            <div class="list-item">
                                <div class="item-title">${e(a.title)}</div>
                                ${a.description ? `<p>${e(a.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${activities.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Extracurricular Activities</h2>
                        ${activities.map(a => `
                            <div class="list-item">
                                <div class="item-title">${e(a.title)}</div>
                                ${a.description ? `<p>${e(a.description)}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${languages.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Languages</h2>
                        <div class="skills-grid">
                            ${languages.map(l => `<span class="skill-item">${e(l.name)}${l.proficiency ? ` (${e(l.proficiency)})` : ''}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    buildSupplementalSections(data, e, layout = 'default') {
        const projects = data.projects || [];
        const certifications = data.certifications || [];
        const achievements = data.achievements || [];
        const activities = data.activities || [];
        const languages = data.languages || [];
        let html = '';

        if (projects.length > 0) {
            html += `<div class="resume-section"><h2 class="section-title">Projects</h2>`;
            html += projects.map(p => `
                <div class="list-item">
                    <div class="item-header">
                        <div><div class="item-title">${e(p.title)}</div>${p.role ? `<div class="item-company">${e(p.role)}</div>` : ''}</div>
                        <div class="item-date">${e(p.duration || '')}</div>
                    </div>
                    ${p.description ? `<p>${e(p.description)}</p>` : ''}
                </div>
            `).join('');
            html += `</div>`;
        }

        if (certifications.length > 0) {
            html += `<div class="resume-section"><h2 class="section-title">Certifications</h2>`;
            html += certifications.map(c => `
                <div class="list-item">
                    <div class="item-header">
                        <div class="item-title">${e(c.name)}</div>
                        <div class="item-date">${e(c.year || '')}</div>
                    </div>
                    ${c.issuer ? `<p>${e(c.issuer)}</p>` : ''}
                </div>
            `).join('');
            html += `</div>`;
        }

        if (achievements.length > 0) {
            html += `<div class="resume-section"><h2 class="section-title">Achievements</h2>`;
            html += achievements.map(a => `
                <div class="list-item">
                    <div class="item-title">${e(a.title)}</div>
                    ${a.description ? `<p>${e(a.description)}</p>` : ''}
                </div>
            `).join('');
            html += `</div>`;
        }

        if (activities.length > 0) {
            html += `<div class="resume-section"><h2 class="section-title">Activities</h2>`;
            html += activities.map(a => `
                <div class="list-item">
                    <div class="item-title">${e(a.title)}</div>
                    ${a.description ? `<p>${e(a.description)}</p>` : ''}
                </div>
            `).join('');
            html += `</div>`;
        }

        if (languages.length > 0 && layout !== 'sidebar') {
            html += `<div class="resume-section"><h2 class="section-title">Languages</h2><div class="skills-grid">`;
            html += languages.map(l => `
                <div class="skill-item"><strong>${e(l.name)}</strong>${l.proficiency ? ` — ${e(l.proficiency)}` : ''}</div>
            `).join('');
            html += `</div></div>`;
        }

        return html;
    }

    renderExecutiveTemplate(data) {
        const { personal, experience, education, skills } = data;
        const e = (v) => this.esc(v);
        const languages = data.languages || [];

        const sidebarSkills = skills.length > 0 ? `
            <div class="exec-block">
                <h2 class="exec-block-title">Skills</h2>
                ${skills.map(s => `
                    <div class="exec-skill">
                        <span class="exec-skill-name">${e(s.name)}</span>
                        ${s.level ? `<span class="exec-skill-level">${e(s.level)}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        ` : '';

        const sidebarLangs = languages.length > 0 ? `
            <div class="exec-block">
                <h2 class="exec-block-title">Languages</h2>
                ${languages.map(l => `<div class="exec-lang">${e(l.name)}${l.proficiency ? ` · ${e(l.proficiency)}` : ''}</div>`).join('')}
            </div>
        ` : '';

        return `
            <div class="template-executive">
                <div class="exec-layout">
                    <aside class="exec-sidebar">
                        <h1 class="exec-name">${e(personal.fullName)}</h1>
                        <div class="exec-divider"></div>
                        <div class="exec-contact">
                            ${personal.email ? `<div><i class="fas fa-envelope"></i> ${e(personal.email)}</div>` : ''}
                            ${personal.phone ? `<div><i class="fas fa-phone"></i> ${e(personal.phone)}</div>` : ''}
                            ${personal.location ? `<div><i class="fas fa-map-marker-alt"></i> ${e(personal.location)}</div>` : ''}
                            ${personal.website ? `<div><i class="fas fa-globe"></i> ${e(personal.website)}</div>` : ''}
                            ${personal.linkedin ? `<div><i class="fab fa-linkedin"></i> LinkedIn</div>` : ''}
                        </div>
                        ${sidebarSkills}
                        ${sidebarLangs}
                    </aside>
                    <main class="exec-main">
                        ${personal.summary ? `
                            <div class="resume-section">
                                <h2 class="section-title">Profile</h2>
                                <p>${e(personal.summary)}</p>
                            </div>
                        ` : ''}
                        ${experience.length > 0 ? `
                            <div class="resume-section">
                                <h2 class="section-title">Experience</h2>
                                ${experience.map(exp => `
                                    <div class="experience-item">
                                        <div class="item-header">
                                            <div>
                                                <div class="item-title">${e(exp.title)}</div>
                                                <div class="item-company">${e(exp.company)}${exp.location ? ` · ${e(exp.location)}` : ''}</div>
                                            </div>
                                            <div class="item-date">${this.formatDate(exp.startDate)} – ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</div>
                                        </div>
                                        ${exp.description ? `<p>${e(exp.description)}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${education.length > 0 ? `
                            <div class="resume-section">
                                <h2 class="section-title">Education</h2>
                                ${education.map(edu => `
                                    <div class="education-item">
                                        <div class="item-header">
                                            <div>
                                                <div class="item-title">${e(edu.degree)}</div>
                                                <div class="item-company">${e(edu.school)}</div>
                                            </div>
                                            <div class="item-date">${this.formatDate(edu.startDate)} – ${this.formatDate(edu.endDate)}</div>
                                        </div>
                                        ${edu.gpa ? `<p class="exec-gpa">GPA: ${e(edu.gpa)}</p>` : ''}
                                        ${edu.description ? `<p>${e(edu.description)}</p>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${this.buildSupplementalSections(data, e, 'sidebar')}
                    </main>
                </div>
            </div>
        `;
    }

    renderCreativeTemplate(data) {
        const { personal, experience, education, skills } = data;
        const e = (v) => this.esc(v);

        const skillTags = skills.length > 0 ? `
            <div class="resume-section">
                <h2 class="section-title">Skills</h2>
                <div class="creative-tags">
                    ${skills.map(s => `<span class="creative-tag">${e(s.name)}${s.level ? `<small>${e(s.level)}</small>` : ''}</span>`).join('')}
                </div>
            </div>
        ` : '';

        const timeline = experience.length > 0 ? `
            <div class="resume-section">
                <h2 class="section-title">Experience</h2>
                <div class="creative-timeline">
                    ${experience.map(exp => `
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">${this.formatDate(exp.startDate)} – ${exp.current ? 'Present' : this.formatDate(exp.endDate)}</div>
                                <div class="item-title">${e(exp.title)}</div>
                                <div class="item-company">${e(exp.company)}${exp.location ? ` · ${e(exp.location)}` : ''}</div>
                                ${exp.description ? `<p>${e(exp.description)}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <div class="template-creative">
                <header class="creative-header">
                    <div class="creative-accent-bar"></div>
                    <h1 class="creative-name">${e(personal.fullName)}</h1>
                    <div class="creative-contact">
                        ${personal.email ? `<span>${e(personal.email)}</span>` : ''}
                        ${personal.phone ? `<span>${e(personal.phone)}</span>` : ''}
                        ${personal.location ? `<span>${e(personal.location)}</span>` : ''}
                        ${personal.website ? `<span>${e(personal.website)}</span>` : ''}
                    </div>
                </header>
                ${personal.summary ? `
                    <div class="creative-summary">
                        <p>${e(personal.summary)}</p>
                    </div>
                ` : ''}
                ${timeline}
                ${education.length > 0 ? `
                    <div class="resume-section">
                        <h2 class="section-title">Education</h2>
                        <div class="creative-edu-grid">
                            ${education.map(edu => `
                                <div class="creative-edu-card">
                                    <div class="item-title">${e(edu.degree)}</div>
                                    <div class="item-company">${e(edu.school)}</div>
                                    <div class="item-date">${this.formatDate(edu.startDate)} – ${this.formatDate(edu.endDate)}</div>
                                    ${edu.gpa ? `<p>GPA: ${e(edu.gpa)}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                ${skillTags}
                ${this.buildSupplementalSections(data, e)}
            </div>
        `;
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString + '-01'); // Add day to make it a valid date
        const options = { year: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    }
    
    getSelectedTemplate() {
        return this.selectedTemplate;
    }
    
    getTemplateData(templateId) {
        return this.templates[templateId];
    }
    
    // Load saved template selection
    loadSavedSelection() {
        const saved = Utils.storage.get('selectedTemplate');
        if (saved && this.templates[saved]) {
            this.selectedTemplate = saved;
            this.updateTemplateSelection();
        }
    }
}

// Initialize template manager
const templateManager = new TemplateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateManager;
}
