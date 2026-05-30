/**
 * Form Handler
 * Manages resume form data, validation, and dynamic form generation
 */

class FormHandler {
    constructor() {
        this.formData = {
            userType: 'professional',
            personal: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                website: '',
                linkedin: '',
                summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            achievements: [],
            activities: [],
            languages: []
        };
        
        this.currentSection = 'personal';
        this.sections = ['personal', 'experience', 'education', 'skills'];
        this.sectionAnimating = false;
        this.autoSaveTimeout = null;
        this.init();
    }
    
    init() {
        this.loadSavedData();
        this.attachEventListeners();
        this.setupAutoSave();
        this.initializeDynamicSections();
        this.applyUserTypeUI();
        this.initStepDots();
        this.updateSectionNav();
        this.updateProgress();
    }

    initStepDots() {
        const container = document.getElementById('stepDots');
        if (!container) return;
        container.innerHTML = this.sections.map((section, i) =>
            `<button type="button" class="step-dot${i === 0 ? ' active' : ''}" data-section="${section}" aria-label="Go to ${section} section" role="tab"></button>`
        ).join('');

        container.querySelectorAll('.step-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const section = dot.dataset.section;
                const dir = this.sections.indexOf(section) - this.sections.indexOf(this.currentSection);
                this.navigateToSection(section, { direction: dir, skipValidation: dir <= 0 });
            });
        });
    }
    
    attachEventListeners() {
        // Section navigation
        document.querySelectorAll('.progress-steps .step').forEach(step => {
            step.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                const dir = this.sections.indexOf(section) - this.sections.indexOf(this.currentSection);
                this.navigateToSection(section, { direction: dir, skipValidation: dir <= 0 });
            });
        });
        
        // Form input changes
        const formEl = document.getElementById('resumeFormElement');
        formEl.addEventListener('input', (e) => {
            this.handleInputChange(e);
        });
        formEl.addEventListener('change', (e) => {
            this.handleInputChange(e);
        });
        
        // Add buttons
        document.getElementById('addExperienceBtn').addEventListener('click', () => {
            this.addExperienceEntry();
        });
        
        document.getElementById('addEducationBtn').addEventListener('click', () => {
            this.addEducationEntry();
        });
        
        document.getElementById('addSkillBtn').addEventListener('click', () => {
            this.addSkillEntry();
        });

        // Projects
        document.getElementById('addProjectBtn')?.addEventListener('click', () => {
            this.addProjectEntry();
        });

        // New dynamic sections
        document.getElementById('addCertificationBtn')?.addEventListener('click', () => {
            this.addCertificationEntry();
        });
        document.getElementById('addAchievementBtn')?.addEventListener('click', () => {
            this.addAchievementEntry();
        });
        document.getElementById('addActivityBtn')?.addEventListener('click', () => {
            this.addActivityEntry();
        });
        document.getElementById('addLanguageBtn')?.addEventListener('click', () => {
            this.addLanguageEntry();
        });

        // User type change
        document.querySelectorAll('input[name="userType"]').forEach(r => {
            r.addEventListener('change', (e) => {
                this.formData.userType = e.target.value;
                this.applyUserTypeUI();
                this.autoSaveHandler();
            });
        });
        
        // Form actions
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.previewResume();
        });
        
        document.getElementById('generatePdfBtn').addEventListener('click', () => {
            this.generatePDF();
        });

        // Section navigation
        document.getElementById('prevSectionBtn')?.addEventListener('click', () => {
            this.navigateSection(-1);
        });
        document.getElementById('nextSectionBtn')?.addEventListener('click', () => {
            const currentIndex = this.sections.indexOf(this.currentSection);
            if (currentIndex === this.sections.length - 1) {
                this.previewResume();
            } else {
                this.navigateSection(1);
            }
        });
        
        // Summary character counter
        const summaryEl = document.getElementById('summary');
        summaryEl?.addEventListener('input', () => this.updateCharCounter());
        this.updateCharCounter();
    }
    
    setupAutoSave() {
        // Auto-save form data every 2 seconds after changes
        this.autoSaveHandler = Utils.debounce(() => {
            this.saveFormData();
            this.showAutoSaveIndicator('saved');
        }, 2000);
    }
    
    handleInputChange(e) {
        const { name, value, type } = e.target;
        const fieldValue = type === 'checkbox' ? e.target.checked : value;
        
        // Update form data
        this.updateFormData(name, fieldValue, e.target);
        
        // Validate field (skip checkboxes for required validation)
        if (type !== 'checkbox') {
            this.validateField(e.target);
        }
        
        // Trigger auto-save
        this.showAutoSaveIndicator('saving');
        this.autoSaveHandler();

        if (name === 'summary') {
            this.updateCharCounter();
        }

        this.updateProgress();
    }
    
    updateFormData(name, value, element) {
        // Handle userType
        if (name === 'userType') {
            this.formData.userType = value;
            return;
        }

        // Handle personal information
        if (this.formData.personal.hasOwnProperty(name)) {
            this.formData.personal[name] = value;
            return;
        }
        
        // Handle dynamic sections (experience, education, skills, projects, certifications, achievements, activities, languages)
        const entryContainer = element.closest('.form-entry') || element.closest('.skill-entry') || element.closest('.simple-entry');
        if (entryContainer) {
            const entryId = entryContainer.dataset.entryId;
            const sectionElement = entryContainer.closest('.form-section');
            const sectionType = sectionElement ? sectionElement.dataset.section : entryContainer.dataset.section || 'skills';
            
            if (sectionType === 'experience') {
                const entry = this.formData.experience.find(exp => exp.id === entryId);
                if (entry) {
                    entry[name] = value;
                    
                    // Handle current position checkbox
                    if (name === 'current') {
                        entry.current = element.checked;
                        const endDateInput = entryContainer.querySelector('[name="endDate"]');
                        if (endDateInput) {
                            endDateInput.disabled = element.checked;
                            if (element.checked) {
                                endDateInput.value = '';
                                entry.endDate = '';
                            }
                        }
                    }
                }
            } else if (sectionType === 'education') {
                const entry = this.formData.education.find(edu => edu.id === entryId);
                if (entry) {
                    entry[name] = value;
                }
            } else if (sectionType === 'skills') {
                const entry = this.formData.skills.find(skill => skill.id === entryId);
                if (entry) {
                    entry[name] = value;
                }
            } else if (sectionType === 'projects') {
                const entry = this.formData.projects.find(p => p.id === entryId);
                if (entry) entry[name] = value;
            } else if (sectionType === 'certifications') {
                const entry = this.formData.certifications.find(c => c.id === entryId);
                if (entry) entry[name] = value;
            } else if (sectionType === 'achievements') {
                const entry = this.formData.achievements.find(a => a.id === entryId);
                if (entry) entry[name] = value;
            } else if (sectionType === 'activities') {
                const entry = this.formData.activities.find(a => a.id === entryId);
                if (entry) entry[name] = value;
            } else if (sectionType === 'languages') {
                const entry = this.formData.languages.find(l => l.id === entryId);
                if (entry) entry[name] = value;
            }
        }
    }
    
    validateField(element) {
        const { name, value, type, required } = element;
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error state
        const formGroup = element.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const existingError = formGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        } else {
            // For elements not in .form-group (like skills), remove error from parent element
            const parent = element.parentElement;
            if (parent) {
                parent.classList.remove('error');
                const existingError = parent.querySelector('.error-message');
                if (existingError) {
                    existingError.remove();
                }
            }
        }
        
        // Required field validation
        if (required && !value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (type === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // URL validation
        if (type === 'url' && value && !Utils.isValidUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }
        
        // Phone validation
        if (type === 'tel' && value && !Utils.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
        
        // Date validation
        if (type === 'month' && value) {
            const date = new Date(value + '-01');
            if (isNaN(date.getTime())) {
                isValid = false;
                errorMessage = 'Please enter a valid date';
            }
        }
        
        // Show error if validation failed
        if (!isValid) {
            this.showFieldError(element, errorMessage);
        }
        
        return isValid;
    }
    
    showFieldError(element, message) {
        const formGroup = element.closest('.form-group');
        let errorContainer;
        
        if (formGroup) {
            formGroup.classList.add('error');
            errorContainer = formGroup;
        } else {
            // For elements not in .form-group (like skills), use parent element
            const parent = element.parentElement;
            if (parent) {
                parent.classList.add('error');
                errorContainer = parent;
            } else {
                console.warn('Could not find error container for element:', element);
                return;
            }
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        errorContainer.appendChild(errorDiv);
    }
    
    navigateToSection(sectionName, options = {}) {
        if (!this.sections.includes(sectionName) || sectionName === this.currentSection || this.sectionAnimating) {
            return;
        }

        const { direction = 0, skipValidation = false } = options;
        const currentIndex = this.sections.indexOf(this.currentSection);
        const targetIndex = this.sections.indexOf(sectionName);
        const dir = direction || (targetIndex - currentIndex);

        if (dir > 0 && !skipValidation && !this.validateCurrentSection()) {
            return;
        }

        const outgoing = document.querySelector('.form-section.active');
        const incoming = document.querySelector(`.form-section[data-section="${sectionName}"]`);

        const applyNavState = () => {
            this.currentSection = sectionName;

            document.querySelectorAll('.progress-steps .step').forEach(step => {
                step.classList.remove('active');
            });
            document.querySelector(`.progress-steps .step[data-section="${sectionName}"]`)?.classList.add('active');

            this.updateSectionNav();
            this.updateProgress();
            this.focusSectionFirstField(sectionName);
        };

        if (outgoing && incoming && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.sectionAnimating = true;
            outgoing.classList.add(dir > 0 ? 'exit-to-left' : 'exit-to-right');

            setTimeout(() => {
                outgoing.classList.remove('active', 'exit-to-left', 'exit-to-right');
                incoming.classList.add('active', dir > 0 ? 'enter-from-right' : 'enter-from-left');

                applyNavState();

                setTimeout(() => {
                    incoming.classList.remove('enter-from-right', 'enter-from-left');
                    this.sectionAnimating = false;
                }, 400);
            }, 260);
        } else {
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active', 'enter-from-right', 'enter-from-left', 'exit-to-left', 'exit-to-right');
            });
            incoming?.classList.add('active');
            applyNavState();
        }
    }

    navigateSection(direction) {
        if (direction > 0 && !this.validateCurrentSection()) return;

        const currentIndex = this.sections.indexOf(this.currentSection);
        const nextIndex = currentIndex + direction;

        if (nextIndex >= 0 && nextIndex < this.sections.length) {
            this.navigateToSection(this.sections[nextIndex], { direction });
        }
    }

    validateCurrentSection() {
        const errors = [];

        switch (this.currentSection) {
            case 'personal':
                ['fullName', 'email'].forEach(name => {
                    const el = document.querySelector(`[name="${name}"]`);
                    if (el) this.validateField(el);
                });
                if (!this.formData.personal.fullName.trim()) errors.push('Full name is required');
                if (!this.formData.personal.email.trim()) errors.push('Email is required');
                else if (!Utils.isValidEmail(this.formData.personal.email)) errors.push('Enter a valid email');
                break;
            case 'experience':
                this.formData.experience.forEach((exp, i) => {
                    const partial = exp.title.trim() || exp.company.trim();
                    if (partial && (!exp.title.trim() || !exp.company.trim())) {
                        errors.push(`Experience ${i + 1}: job title and company are both required`);
                    }
                });
                break;
            case 'education':
                this.formData.education.forEach((edu, i) => {
                    const partial = edu.degree.trim() || edu.school.trim();
                    if (partial && (!edu.degree.trim() || !edu.school.trim())) {
                        errors.push(`Education ${i + 1}: degree and school are both required`);
                    }
                });
                break;
            case 'skills':
                break;
        }

        if (errors.length > 0) {
            Utils.showToast(errors.join('\n• '), 'warning', 4500);
            this.scrollToFirstError();
            return false;
        }
        return true;
    }

    scrollToFirstError() {
        const section = document.querySelector(`.form-section[data-section="${this.currentSection}"]`);
        const errorField = section?.querySelector('.form-group.error input, .form-group.error textarea, .form-group.error select')
            || section?.querySelector('[required]:invalid, [required][value=""]');
        if (errorField) {
            errorField.focus({ preventScroll: true });
            Utils.scrollTo(errorField, { block: 'center' });
        }
    }

    focusSectionFirstField(sectionName) {
        setTimeout(() => {
            const section = document.querySelector(`.form-section[data-section="${sectionName}"]`);
            const field = section?.querySelector(
                'input:not([type="radio"]):not([type="checkbox"]):not([disabled]), textarea, select'
            );
            field?.focus({ preventScroll: true });
        }, 420);
    }

    updateSectionNav() {
        const currentIndex = this.sections.indexOf(this.currentSection);
        const prevBtn = document.getElementById('prevSectionBtn');
        const nextBtn = document.getElementById('nextSectionBtn');
        const indicator = document.getElementById('sectionIndicator');

        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) {
            nextBtn.innerHTML = currentIndex === this.sections.length - 1
                ? '<i class="fas fa-eye"></i> Preview'
                : 'Next <i class="fas fa-arrow-right"></i>';
        }
        if (indicator) {
            indicator.textContent = `Step ${currentIndex + 1} of ${this.sections.length}`;
        }

        document.querySelectorAll('.step-dot').forEach((dot, i) => {
            const section = this.sections[i];
            dot.classList.toggle('active', i === currentIndex);
            dot.classList.toggle('completed', i !== currentIndex && this.isSectionComplete(section));
        });
    }

    updateProgress() {
        const { personal, experience, education, skills } = this.formData;
        let score = 0;

        if (personal.fullName.trim()) score += 15;
        if (personal.email.trim() && Utils.isValidEmail(personal.email)) score += 15;
        if (personal.summary.trim()) score += 10;
        if (experience.some(e => e.title.trim() && e.company.trim())) score += 20;
        if (education.some(e => e.degree.trim() && e.school.trim())) score += 20;
        if (skills.some(s => s.name.trim())) score += 20;

        const fill = document.getElementById('formProgressFill');
        const bar = fill?.closest('[role="progressbar"]');
        if (fill) fill.style.width = `${score}%`;
        if (bar) bar.setAttribute('aria-valuenow', score);

        this.sections.forEach(section => {
            const step = document.querySelector(`.progress-steps .step[data-section="${section}"]`);
            if (!step) return;
            const isComplete = this.isSectionComplete(section);
            step.classList.toggle('completed', isComplete);
        });
    }

    isSectionComplete(section) {
        switch (section) {
            case 'personal':
                return !!(this.formData.personal.fullName.trim() && this.formData.personal.email.trim());
            case 'experience':
                return this.formData.experience.some(e => e.title.trim() && e.company.trim());
            case 'education':
                return this.formData.education.some(e => e.degree.trim() && e.school.trim());
            case 'skills':
                return this.formData.skills.some(s => s.name.trim());
            default:
                return false;
        }
    }

    updateCharCounter() {
        const summary = document.getElementById('summary');
        const counter = document.getElementById('summaryCounter');
        if (!summary || !counter) return;

        const len = summary.value.length;
        const max = summary.maxLength || 500;
        counter.textContent = `${len} / ${max}`;
        counter.classList.toggle('warning', len > max * 0.85 && len < max);
        counter.classList.toggle('limit', len >= max);
    }
    
    initializeDynamicSections() {
        this.renderEmptyStates();

        if (this.formData.experience.length === 0) {
            this.addExperienceEntry();
        }
        
        if (this.formData.education.length === 0) {
            this.addEducationEntry();
        }
    }

    renderEmptyStates() {
        const containers = [
            { id: 'skillsContainer', key: 'skills', icon: 'fa-cogs', text: 'No skills added yet.', btn: 'addSkillBtn', label: 'Add your first skill' },
            { id: 'projectsContainer', key: 'projects', icon: 'fa-folder-open', text: 'No projects added yet.', btn: 'addProjectBtn', label: 'Add a project' },
            { id: 'certificationsContainer', key: 'certifications', icon: 'fa-certificate', text: 'No certifications added yet.', btn: 'addCertificationBtn', label: 'Add a certification' },
            { id: 'achievementsContainer', key: 'achievements', icon: 'fa-trophy', text: 'No achievements added yet.', btn: 'addAchievementBtn', label: 'Add an achievement' },
            { id: 'activitiesContainer', key: 'activities', icon: 'fa-users', text: 'No activities added yet.', btn: 'addActivityBtn', label: 'Add an activity' },
            { id: 'languagesContainer', key: 'languages', icon: 'fa-language', text: 'No languages added yet.', btn: 'addLanguageBtn', label: 'Add a language' }
        ];

        containers.forEach(({ id, key, icon, text, btn, label }) => {
            const container = document.getElementById(id);
            if (!container || this.formData[key]?.length > 0) return;
            if (container.querySelector('.form-entry, .skill-entry, .simple-entry')) return;

            container.innerHTML = `
                <div class="empty-state" data-empty-for="${id}">
                    <i class="fas ${icon}"></i>
                    <p>${text}</p>
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('${btn}').click()">
                        <i class="fas fa-plus"></i> ${label}
                    </button>
                </div>
            `;
        });
    }

    clearEmptyState(containerId) {
        const container = document.getElementById(containerId);
        container?.querySelector(`[data-empty-for="${containerId}"]`)?.remove();
    }
    
    addExperienceEntry(data = null) {
        const id = Utils.generateId();
        const experienceData = data || {
            id,
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        
        if (!data) {
            this.formData.experience.push(experienceData);
        }
        
        const container = document.getElementById('experienceContainer');
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-entry';
        entryDiv.dataset.entryId = id;
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Experience ${this.formData.experience.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('experience', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="title_${id}">Job Title *</label>
                    <input type="text" id="title_${id}" name="title" value="${experienceData.title}" required>
                </div>
                <div class="form-group">
                    <label for="company_${id}">Company *</label>
                    <input type="text" id="company_${id}" name="company" value="${experienceData.company}" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="location_${id}">Location</label>
                    <input type="text" id="location_${id}" name="location" value="${experienceData.location}" placeholder="City, State">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="current" ${experienceData.current ? 'checked' : ''}>
                        I currently work here
                    </label>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="startDate_${id}">Start Date *</label>
                    <input type="month" id="startDate_${id}" name="startDate" value="${experienceData.startDate}" required>
                </div>
                <div class="form-group">
                    <label for="endDate_${id}">End Date</label>
                    <input type="month" id="endDate_${id}" name="endDate" value="${experienceData.endDate}" ${experienceData.current ? 'disabled' : ''}>
                </div>
            </div>
            
            <div class="form-group">
                <label for="description_${id}">Job Description</label>
                <textarea id="description_${id}" name="description" rows="4" placeholder="Describe your responsibilities and achievements...">${experienceData.description}</textarea>
            </div>
        `;
        
        container.appendChild(entryDiv);
        
        // Focus on the first input
        const firstInput = entryDiv.querySelector('input[type="text"]');
        if (firstInput && !data) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    addEducationEntry(data = null) {
        const id = Utils.generateId();
        const educationData = data || {
            id,
            degree: '',
            school: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: '',
            description: ''
        };
        
        if (!data) {
            this.formData.education.push(educationData);
        }
        
        const container = document.getElementById('educationContainer');
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-entry';
        entryDiv.dataset.entryId = id;
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Education ${this.formData.education.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('education', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="degree_${id}">Degree/Certificate *</label>
                    <input type="text" id="degree_${id}" name="degree" value="${educationData.degree}" placeholder="e.g., Bachelor of Science in Computer Science" required>
                </div>
                <div class="form-group">
                    <label for="school_${id}">School/Institution *</label>
                    <input type="text" id="school_${id}" name="school" value="${educationData.school}" required>
                </div>
            </div>
            
            <div class="form-row-3">
                <div class="form-group">
                    <label for="location_${id}">Location</label>
                    <input type="text" id="location_${id}" name="location" value="${educationData.location}" placeholder="City, State">
                </div>
                <div class="form-group">
                    <label for="startDate_${id}">Start Date</label>
                    <input type="month" id="startDate_${id}" name="startDate" value="${educationData.startDate}">
                </div>
                <div class="form-group">
                    <label for="endDate_${id}">End Date</label>
                    <input type="month" id="endDate_${id}" name="endDate" value="${educationData.endDate}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="gpa_${id}">GPA (Optional)</label>
                    <input type="text" id="gpa_${id}" name="gpa" value="${educationData.gpa}" placeholder="e.g., 3.8">
                </div>
                <div class="form-group">
                    <!-- Spacer -->
                </div>
            </div>
            
            <div class="form-group">
                <label for="description_${id}">Additional Details</label>
                <textarea id="description_${id}" name="description" rows="3" placeholder="Relevant coursework, honors, activities...">${educationData.description}</textarea>
            </div>
        `;
        
        container.appendChild(entryDiv);
        
        // Focus on the first input
        const firstInput = entryDiv.querySelector('input[type="text"]');
        if (firstInput && !data) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
    
    addSkillEntry(skillName = '', skillLevel = 'Intermediate', data = null) {
        const id = Utils.generateId();
        const skillData = data || {
            id,
            name: skillName,
            level: skillLevel
        };
        
        if (!data) {
            this.formData.skills.push(skillData);
        }
        
        const container = document.getElementById('skillsContainer');
        this.clearEmptyState('skillsContainer');
        
        // Create skills container if it doesn't exist
        let skillsGrid = container.querySelector('.skills-container');
        if (!skillsGrid) {
            skillsGrid = document.createElement('div');
            skillsGrid.className = 'skills-container';
            container.appendChild(skillsGrid);
        }
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'skill-entry';
        entryDiv.dataset.entryId = id;
        
        entryDiv.innerHTML = `
            <input type="text" name="name" value="${skillData.name}" placeholder="Skill name..." required>
            <div class="skill-level">
                <select name="level">
                    <option value="Beginner" ${skillData.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                    <option value="Intermediate" ${skillData.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                    <option value="Advanced" ${skillData.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
                    <option value="Expert" ${skillData.level === 'Expert' ? 'selected' : ''}>Expert</option>
                </select>
            </div>
            <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('skills', '${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        skillsGrid.appendChild(entryDiv);
        
        // Focus on the input if it's a new entry
        const input = entryDiv.querySelector('input');
        if (input && !data && !skillName) {
            setTimeout(() => input.focus(), 100);
        }
    }

    addProjectEntry(data = null) {
        const id = Utils.generateId();
        const entry = data || { id, title: '', role: '', duration: '', description: '' };
        if (!data) this.formData.projects.push(entry);
        const container = document.getElementById('projectsContainer');
        this.clearEmptyState('projectsContainer');
        const div = document.createElement('div');
        div.className = 'form-entry';
        div.dataset.entryId = id;
        div.dataset.section = 'projects';
        div.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Project ${this.formData.projects.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('projects', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Project Title *</label>
                    <input type="text" name="title" value="${entry.title}" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" name="role" value="${entry.role}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" name="duration" value="${entry.duration}" placeholder="e.g., Jan 2024 - May 2024">
                </div>
                <div class="form-group"></div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Key responsibilities, tech stack, outcomes...">${entry.description}</textarea>
            </div>
        `;
        container.appendChild(div);
    }

    addCertificationEntry(data = null) {
        const id = Utils.generateId();
        const entry = data || { id, name: '', issuer: '', year: '' };
        if (!data) this.formData.certifications.push(entry);
        const container = document.getElementById('certificationsContainer');
        this.clearEmptyState('certificationsContainer');
        const div = document.createElement('div');
        div.className = 'form-entry';
        div.dataset.entryId = id;
        div.dataset.section = 'certifications';
        div.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Certification ${this.formData.certifications.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('certifications', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-row-3">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${entry.name}" required>
                </div>
                <div class="form-group">
                    <label>Issuer</label>
                    <input type="text" name="issuer" value="${entry.issuer}">
                </div>
                <div class="form-group">
                    <label>Year</label>
                    <input type="text" name="year" value="${entry.year}" placeholder="e.g., 2024">
                </div>
            </div>
        `;
        container.appendChild(div);
    }

    addAchievementEntry(data = null) {
        const id = Utils.generateId();
        const entry = data || { id, title: '', description: '' };
        if (!data) this.formData.achievements.push(entry);
        const container = document.getElementById('achievementsContainer');
        this.clearEmptyState('achievementsContainer');
        const div = document.createElement('div');
        div.className = 'form-entry';
        div.dataset.entryId = id;
        div.dataset.section = 'achievements';
        div.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Achievement ${this.formData.achievements.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('achievements', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" value="${entry.title}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3">${entry.description}</textarea>
            </div>
        `;
        container.appendChild(div);
    }

    addActivityEntry(data = null) {
        const id = Utils.generateId();
        const entry = data || { id, title: '', description: '' };
        if (!data) this.formData.activities.push(entry);
        const container = document.getElementById('activitiesContainer');
        this.clearEmptyState('activitiesContainer');
        const div = document.createElement('div');
        div.className = 'form-entry';
        div.dataset.entryId = id;
        div.dataset.section = 'activities';
        div.innerHTML = `
            <div class="entry-header">
                <h4 class="entry-title">Activity ${this.formData.activities.length}</h4>
                <div class="entry-actions">
                    <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('activities', '${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" value="${entry.title}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3">${entry.description}</textarea>
            </div>
        `;
        container.appendChild(div);
    }

    addLanguageEntry(data = null) {
        const id = Utils.generateId();
        const entry = data || { id, name: '', proficiency: 'Fluent' };
        if (!data) this.formData.languages.push(entry);
        const container = document.getElementById('languagesContainer');
        this.clearEmptyState('languagesContainer');
        const div = document.createElement('div');
        div.className = 'simple-entry';
        div.dataset.entryId = id;
        div.dataset.section = 'languages';
        div.innerHTML = `
            <input type="text" name="name" value="${entry.name}" placeholder="Language (e.g., English)" required>
            <div class="skill-level">
                <select name="proficiency">
                    <option value="Basic" ${entry.proficiency==='Basic'?'selected':''}>Basic</option>
                    <option value="Conversational" ${entry.proficiency==='Conversational'?'selected':''}>Conversational</option>
                    <option value="Fluent" ${entry.proficiency==='Fluent'?'selected':''}>Fluent</option>
                    <option value="Native" ${entry.proficiency==='Native'?'selected':''}>Native</option>
                </select>
            </div>
            <button type="button" class="btn-icon btn-remove" onclick="formHandler.removeEntry('languages', '${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    }
    
    removeEntry(section, id) {
        // Remove from data
        this.formData[section] = this.formData[section].filter(item => item.id !== id);
        
        // Remove from DOM
        const entryElement = document.querySelector(`[data-entry-id="${id}"]`);
        if (entryElement) {
            entryElement.style.animation = 'slideOutUp 0.3s ease';
            setTimeout(() => {
                entryElement.remove();
                this.updateEntryTitles(section);
            }, 300);
        }
        
        // Auto-save
        this.autoSaveHandler();
        
        Utils.showToast(`${Utils.capitalize(section.slice(0, -1))} entry removed`, 'info');
    }
    
    updateEntryTitles(section) {
        const container = document.getElementById(`${section}Container`);
        const entries = container.querySelectorAll('.form-entry');
        
        entries.forEach((entry, index) => {
            const title = entry.querySelector('.entry-title');
            if (title) {
                const base = section === 'activities' ? 'Activity' : section === 'achievements' ? 'Achievement' : section === 'certifications' ? 'Certification' : section === 'projects' ? 'Project' : Utils.capitalize(section.slice(0, -1));
                title.textContent = `${base} ${index + 1}`;
            }
        });
    }
    
    validateForm() {
        let isValid = true;
        const errors = [];
        
        // Validate personal information
        if (!this.formData.personal.fullName.trim()) {
            errors.push('Full name is required');
            isValid = false;
        }
        
        if (!this.formData.personal.email.trim()) {
            errors.push('Email is required');
            isValid = false;
        } else if (!Utils.isValidEmail(this.formData.personal.email)) {
            errors.push('Valid email is required');
            isValid = false;
        }
        
        // Additional conditional validations
        if (this.formData.userType === 'professional') {
            // At least one experience is okay but not strictly required
        } else {
            // Student: encourage education
            if (this.formData.education.length === 0) {
                errors.push('Add at least one education entry for Student');
                isValid = false;
            }
        }

        // Validate experience entries
        this.formData.experience.forEach((exp, index) => {
            if (!exp.title.trim() || !exp.company.trim()) {
                errors.push(`Experience ${index + 1}: Job title and company are required`);
                isValid = false;
            }
        });
        
        // Validate education entries
        this.formData.education.forEach((edu, index) => {
            if (!edu.degree.trim() || !edu.school.trim()) {
                errors.push(`Education ${index + 1}: Degree and school are required`);
                isValid = false;
            }
        });
        
        if (errors.length > 0) {
            Utils.showToast(`Please fix these errors:\n• ${errors.join('\n• ')}`, 'error', 6000);
        }
        
        return isValid;
    }
    
    previewResume() {
        if (!this.validateForm()) {
            return;
        }
        
        // Save current data
        this.saveFormData();
        
        // Navigate to preview
        window.app.navigateToPreview();
    }
    
    generatePDF() {
        if (!this.validateForm()) {
            return;
        }
        
        Utils.showLoading('Generating PDF...');
        
        // Use PDF generator
        setTimeout(() => {
            pdfGenerator.generatePDF(this.formData, templateManager.getSelectedTemplate())
                .then(() => {
                    Utils.hideLoading();
                    Utils.showToast('Resume PDF generated successfully!', 'success');
                })
                .catch(error => {
                    Utils.hideLoading();
                    Utils.showToast('Error generating PDF. Please try again.', 'error');
                    console.error('PDF generation error:', error);
                });
        }, 500);
    }
    
    saveFormData() {
        Utils.storage.set('resumeFormData', this.formData);
    }
    
    loadSavedData() {
        const savedData = Utils.storage.get('resumeFormData');
        if (savedData) {
            this.formData = { ...this.formData, ...savedData };
            this.populateForm();
        }
    }
    
    populateForm() {
        // Clear dynamic containers before repopulating
        ['experienceContainer', 'educationContainer', 'skillsContainer', 'projectsContainer',
         'certificationsContainer', 'achievementsContainer', 'activitiesContainer', 'languagesContainer']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });

        Object.keys(this.formData.personal).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = this.formData.personal[key];
            }
        });

        // User type radios
        const userType = this.formData.userType || 'professional';
        const radio = document.querySelector(`input[name="userType"][value="${userType}"]`);
        if (radio) radio.checked = true;
        this.applyUserTypeUI();
        
        // Populate dynamic sections
        this.formData.experience.forEach(exp => {
            this.addExperienceEntry(exp);
        });
        
        this.formData.education.forEach(edu => {
            this.addEducationEntry(edu);
        });
        
        this.formData.skills.forEach(skill => {
            this.addSkillEntry(skill.name, skill.level, skill);
        });

        this.formData.projects?.forEach(p => this.addProjectEntry(p));
        this.formData.certifications.forEach(c => this.addCertificationEntry(c));
        this.formData.achievements.forEach(a => this.addAchievementEntry(a));
        this.formData.activities.forEach(a => this.addActivityEntry(a));
        this.formData.languages.forEach(l => this.addLanguageEntry(l));

        this.updateCharCounter();
        this.updateSectionNav();
        this.updateProgress();
    }
    
    showAutoSaveIndicator(status) {
        // Remove existing indicators
        const existingIndicators = document.querySelectorAll('.auto-save-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        const indicator = document.createElement('div');
        indicator.className = `auto-save-indicator ${status}`;
        
        const icons = {
            saving: 'fas fa-spinner fa-spin',
            saved: 'fas fa-check',
            error: 'fas fa-exclamation-triangle'
        };
        
        const messages = {
            saving: 'Saving...',
            saved: 'Saved',
            error: 'Save failed'
        };
        
        indicator.innerHTML = `
            <i class="${icons[status]}"></i>
            <span>${messages[status]}</span>
        `;
        
        // Add to form actions
        const formActions = document.querySelector('.form-actions');
        if (formActions) {
            formActions.appendChild(indicator);
            
            // Remove after 2 seconds if saved
            if (status === 'saved') {
                setTimeout(() => indicator.remove(), 2000);
            }
        }
    }
    
    getFormData() {
        return this.formData;
    }
    
    clearFormData() {
        this.formData = {
            userType: 'professional',
            personal: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                website: '',
                linkedin: '',
                summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            achievements: [],
            activities: [],
            languages: []
        };
        
        Utils.storage.remove('resumeFormData');
        
        // Clear form UI
        document.getElementById('resumeFormElement').reset();
        document.getElementById('experienceContainer').innerHTML = '';
        document.getElementById('educationContainer').innerHTML = '';
        document.getElementById('skillsContainer').innerHTML = '';
        document.getElementById('projectsContainer').innerHTML = '';
        document.getElementById('certificationsContainer').innerHTML = '';
        document.getElementById('achievementsContainer').innerHTML = '';
        document.getElementById('activitiesContainer').innerHTML = '';
        document.getElementById('languagesContainer').innerHTML = '';
        
        // Reinitialize
        this.initializeDynamicSections();
        this.applyUserTypeUI();
        this.updateSectionNav();
        this.updateProgress();
        
        Utils.showToast('Form cleared successfully', 'info');
    }

    applyUserTypeUI() {
        const type = this.formData.userType || 'professional';
        const certifications = document.getElementById('certificationsSection');
        const projects = document.getElementById('projectsSection');
        const achievements = document.getElementById('achievementsSection');
        const activities = document.getElementById('activitiesSection');
        const languages = document.getElementById('languagesSection');
        const expTitle = document.getElementById('experienceSectionTitle');

        if (type === 'professional') {
            if (certifications) certifications.style.display = '';
            if (projects) projects.style.display = '';
            if (achievements) achievements.style.display = 'none';
            if (activities) activities.style.display = 'none';
            if (languages) languages.style.display = '';
            if (expTitle) expTitle.textContent = 'Work Experience';
        } else {
            if (certifications) certifications.style.display = 'none';
            if (projects) projects.style.display = 'none';
            if (achievements) achievements.style.display = '';
            if (activities) activities.style.display = '';
            if (languages) languages.style.display = '';
            if (expTitle) expTitle.textContent = 'Academic Projects / Internships';
        }
    }
}

// Initialize form handler
const formHandler = new FormHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}
