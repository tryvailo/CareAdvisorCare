/**
 * questionnaire.js - Care Home Questionnaire functionality
 * Integrated with existing project structure
 */

class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 8;
        this.formData = {};
        this.startTime = Date.now();
        this.storageKey = 'careHomeQuestionnaire';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadSavedData();
        this.addAccessibilityFeatures();
        
        // Initialize sections visibility
        this.showSection(1);
        
        console.log('CareHomeQuestionnaire initialized');
    }

    addAccessibilityFeatures() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('rating-btn')) {
                e.target.click();
            }
            
            // Arrow key navigation for rating buttons
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.classList.contains('rating-btn')) {
                e.preventDefault();
                const ratingGroup = e.target.closest('.rating-group');
                const buttons = Array.from(ratingGroup.querySelectorAll('.rating-btn'));
                const currentIndex = buttons.indexOf(e.target);
                
                let nextIndex;
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                } else {
                    nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                }
                
                buttons[nextIndex].focus();
            }
        });
    }

    bindEvents() {
        // Navigation buttons
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSection());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSection());
        
        // Form submission
        const form = document.getElementById('questionnaire-form');
        if (form) {
            form.addEventListener('submit', (e) => this.submitForm(e));
        }
        
        // Setup form interactions
        this.setupRadioButtons();
        this.setupCheckboxes();
        this.setupRatingButtons();
        this.setupConditionalLogic();
        
        // Auto-save on input
        document.addEventListener('input', () => this.saveFormData());
        document.addEventListener('change', () => this.saveFormData());
    }

    setupRadioButtons() {
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // Prevent double-clicking on the input itself
                if (e.target.type === 'radio') return;
                
                const input = option.querySelector('input[type="radio"]');
                if (input && !input.disabled) {
                    input.checked = true;
                    this.updateRadioSelection(input.name);
                    this.saveFormData();
                    
                    // Announce selection for screen readers
                    if (window.CareHomeUtils) {
                        window.CareHomeUtils.announceToScreenReader(`Selected: ${input.nextElementSibling.textContent}`);
                    }
                }
            });
        });

        // Handle direct input clicks
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateRadioSelection(input.name);
                this.saveFormData();
            });
        });
    }

    setupCheckboxes() {
        document.querySelectorAll('.checkbox-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // Prevent double-clicking on the input itself
                if (e.target.type === 'checkbox') return;
                
                const input = option.querySelector('input[type="checkbox"]');
                if (input && !input.disabled) {
                    input.checked = !input.checked;
                    this.updateCheckboxSelection(input.name);
                    this.saveFormData();
                    
                    // Handle "none" exclusive selection
                    this.handleExclusiveCheckbox(input);
                }
            });
        });

        // Handle direct input clicks
        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => {
                this.updateCheckboxSelection(input.name);
                this.handleExclusiveCheckbox(input);
                this.saveFormData();
            });
        });
    }

    handleExclusiveCheckbox(input) {
        // Handle exclusive checkboxes (like "none" options)
        if (input.value === 'none' || input.value === 'no_preference' || input.value === 'not_important') {
            if (input.checked) {
                // Uncheck all other options in the same group
                document.querySelectorAll(`input[name="${input.name}"]:not([value="${input.value}"])`).forEach(other => {
                    other.checked = false;
                    this.updateCheckboxSelection(other.name);
                });
            }
        } else {
            // If any other option is selected, uncheck exclusive options
            const exclusiveValues = ['none', 'no_preference', 'not_important'];
            exclusiveValues.forEach(value => {
                const exclusiveInput = document.querySelector(`input[name="${input.name}"][value="${value}"]`);
                if (exclusiveInput && exclusiveInput.checked) {
                    exclusiveInput.checked = false;
                    this.updateCheckboxSelection(exclusiveInput.name);
                }
            });
        }
    }

    setupRatingButtons() {
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = btn.dataset.name;
                const value = btn.dataset.value;
                
                if (!name || !value) return;
                
                // Clear previous selections
                document.querySelectorAll(`[data-name="${name}"]`).forEach(b => {
                    b.classList.remove('selected');
                    b.setAttribute('aria-pressed', 'false');
                });
                
                // Select current
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
                
                // Update hidden input
                const hiddenInput = document.querySelector(`input[name="${name}"]`);
                if (hiddenInput) {
                    hiddenInput.value = value;
                }
                
                // Announce selection for screen readers
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.announceToScreenReader(`Selected rating: ${value}`);
                }
                
                this.saveFormData();
            });

            // Add ARIA attributes
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('tabindex', '0');
        });
    }

    setupConditionalLogic() {
        this.setupPatientNameLogic();
        this.setupLanguageLogic();
    }

    setupPatientNameLogic() {
        const relationshipInputs = document.querySelectorAll('input[name="contact_004"]');
        const patientNameSection = document.getElementById('patient-name-section');
        const patientNameInput = document.getElementById('contact_005');

        if (!relationshipInputs.length || !patientNameSection) return;

        const togglePatientName = () => {
            const selectedValue = document.querySelector('input[name="contact_004"]:checked')?.value;
            
            if (selectedValue === 'myself') {
                patientNameSection.style.display = 'none';
                if (patientNameInput) {
                    patientNameInput.removeAttribute('required');
                    patientNameInput.value = '';
                }
            } else {
                patientNameSection.style.display = 'block';
                if (patientNameInput) {
                    patientNameInput.setAttribute('required', 'required');
                }
            }
        };

        relationshipInputs.forEach(input => {
            input.addEventListener('change', togglePatientName);
        });

        // Initial check
        togglePatientName();
    }

    setupLanguageLogic() {
        const languageInputs = document.querySelectorAll('input[name="culture_001"]');
        const otherLanguageSection = document.getElementById('other-language-section');
        const otherLanguageInput = document.getElementById('culture_002');

        if (!languageInputs.length || !otherLanguageSection) return;

        const toggleOtherLanguage = () => {
            const selectedValue = document.querySelector('input[name="culture_001"]:checked')?.value;
            
            if (selectedValue === 'other_language') {
                otherLanguageSection.style.display = 'block';
                if (otherLanguageInput) {
                    otherLanguageInput.setAttribute('required', 'required');
                }
            } else {
                otherLanguageSection.style.display = 'none';
                if (otherLanguageInput) {
                    otherLanguageInput.removeAttribute('required');
                    otherLanguageInput.value = '';
                }
            }
        };

        languageInputs.forEach(input => {
            input.addEventListener('change', toggleOtherLanguage);
        });

        // Initial check
        toggleOtherLanguage();
    }

    updateRadioSelection(name) {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            const option = radio.closest('.radio-option');
            if (option) {
                option.classList.toggle('selected', radio.checked);
            }
        });
    }

    updateCheckboxSelection(name) {
        document.querySelectorAll(`input[name="${name}"]`).forEach(checkbox => {
            const option = checkbox.closest('.checkbox-option');
            if (option) {
                option.classList.toggle('selected', checkbox.checked);
            }
        });
    }

    nextSection() {
        if (this.validateCurrentSection()) {
            if (this.currentSection < this.totalSections) {
                this.currentSection++;
                
                // Show 50% celebration milestone
                if (this.currentSection === 4) {
                    this.showMilestoneMessage();
                }
                
                this.showSection(this.currentSection);
                this.updateProgress();
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.scrollToTop();
                }
            }
        }
    }
    
    showMilestoneMessage() {
        const celebration = document.createElement('div');
        celebration.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl shadow-2xl z-50 text-center max-w-md';
        celebration.style.transform = 'translateX(-50%) translateY(-100%)';
        celebration.style.opacity = '0';
        celebration.style.transition = 'all 0.5s ease';
        
        celebration.innerHTML = `
            <div class="text-3xl mb-2">🎉</div>
            <h3 class="text-xl font-bold mb-2">Halfway Complete!</h3>
            <p class="text-sm">Your profile is already much more detailed than any free service. The AI is building a comprehensive picture of your needs.</p>
        `;
        
        document.body.appendChild(celebration);
        
        // Animate in
        setTimeout(() => {
            celebration.style.transform = 'translateX(-50%) translateY(0)';
            celebration.style.opacity = '1';
        }, 100);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            celebration.style.opacity = '0';
            celebration.style.transform = 'translateX(-50%) translateY(-100%)';
            
            setTimeout(() => {
                if (celebration.parentNode) {
                    celebration.remove();
                }
            }, 500);
        }, 3500);
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();
            if (window.CareHomeUtils) {
                window.CareHomeUtils.scrollToTop();
            }
        }
    }

    validateCurrentSection() {
        const currentSectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (!currentSectionElement) {
            console.error(`Section ${this.currentSection} not found`);
            return false;
        }

        const requiredFields = currentSectionElement.querySelectorAll('[required]');
        let isValid = true;

        // Clear previous errors
        currentSectionElement.querySelectorAll('.error-msg').forEach(error => {
            error.remove();
        });

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const radioGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    this.showError(field.closest('div'), 'Please select an option');
                    isValid = false;
                }
            } else if (field.type === 'checkbox') {
                const checkboxGroup = currentSectionElement.querySelectorAll(`input[name="${field.name}"]`);
                const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
                if (!isChecked) {
                    this.showError(field.closest('div'), 'Please select at least one option');
                    isValid = false;
                }
            } else if (field.type === 'hidden') {
                // For rating scales with hidden inputs
                if (!field.value) {
                    const ratingContainer = field.closest('div');
                    this.showError(ratingContainer, 'Please make a selection');
                    isValid = false;
                }
            } else if (field.type === 'email') {
                if (!field.value.trim()) {
                    this.showError(field, 'This field is required');
                    isValid = false;
                } else if (window.CareHomeUtils && !window.CareHomeUtils.validateEmail(field.value)) {
                    this.showError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            } else if (!field.value.trim()) {
                this.showError(field, 'This field is required');
                isValid = false;
            }
        });

        return isValid;
    }

    showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-msg';
        errorDiv.textContent = message;
        errorDiv.setAttribute('role', 'alert');
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.parentNode.appendChild(errorDiv);
        } else {
            element.appendChild(errorDiv);
        }

        // Scroll to first error
        if (element.getBoundingClientRect().top < 0) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showSection(sectionNumber) {
        // Hide all sections
        document.querySelectorAll('.question-section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        // Show current section
        const currentSection = document.querySelector(`[data-section="${sectionNumber}"]`);
        if (currentSection) {
            currentSection.classList.add('active');
            currentSection.style.display = 'block';
        }

        // Update navigation buttons
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentSection === 1 ? 'none' : 'block';
        }

        if (this.currentSection === this.totalSections) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progress = (this.currentSection / this.totalSections) * 100;
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        // Update section text
        const currentSectionSpan = document.getElementById('current-section');
        if (currentSectionSpan) {
            currentSectionSpan.textContent = this.currentSection;
        }
        
        // Update motivational message
        this.updateMotivationalMessage(progress);
    }
    
    updateMotivationalMessage(progress) {
        const motivationDiv = document.getElementById('progress-motivation');
        if (!motivationDiv) return;
        
        const messages = [
            {
                title: "Ready to begin your personalised care home assessment",
                subtitle: "Each answer helps our AI create more accurate recommendations just for you"
            },
            {
                title: "Each answer makes your recommendations more personalised",
                subtitle: "Location preferences help us find care homes in the right area for your family"
            },
            {
                title: "Budget information ensures realistic recommendations",
                subtitle: "No hidden costs - we'll show you exactly what to expect financially"
            },
            {
                title: "Halfway there! Your profile is already far more detailed than any free service",
                subtitle: "Medical needs are crucial - this ensures we find homes with the right expertise"
            },
            {
                title: "Cultural preferences make a real difference to daily comfort",
                subtitle: "Language and religious needs often determine long-term happiness in care"
            },
            {
                title: "Comfort preferences create truly personalised matches",
                subtitle: "Activities and lifestyle choices help identify homes where you'll feel at home"
            },
            {
                title: "Family involvement shapes your care experience significantly",
                subtitle: "Visiting arrangements and family support are essential for peace of mind"
            },
            {
                title: "Your comprehensive profile is ready for AI analysis",
                subtitle: "Timeline and additional details complete your unique care home requirements"
            }
        ];
        
        const message = messages[this.currentSection - 1];
        
        motivationDiv.innerHTML = `
            <p class="text-lg font-semibold text-blue-800">${message.title}</p>
            <p class="text-gray-600 mt-2">${message.subtitle}</p>
        `;
        
        // Update styling based on progress
        let className = 'text-center mb-8 p-4 rounded-lg border';
        if (progress >= 50) {
            className += ' bg-gradient-to-r from-green-50 to-blue-50 border-green-200';
        } else if (progress >= 75) {
            className += ' bg-gradient-to-r from-orange-50 to-green-50 border-orange-200';
        } else {
            className += ' bg-gradient-to-r from-blue-50 to-green-50 border-blue-200';
        }
        
        motivationDiv.className = className;
    }

    saveFormData() {
        const formData = new FormData(document.getElementById('questionnaire-form'));
        const data = Object.fromEntries(formData);
        
        // Add metadata
        data.currentSection = this.currentSection;
        data.timestamp = new Date().toISOString();
        
        // Save to localStorage with 24-hour expiry
        if (window.CareHomeUtils) {
            window.CareHomeUtils.saveToStorage(this.storageKey, data);
        }
    }

    loadSavedData() {
        let savedData = null;
        if (window.CareHomeUtils) {
            savedData = window.CareHomeUtils.loadFromStorage(this.storageKey);
        }
        
        if (savedData) {
            this.formData = savedData;
            this.currentSection = savedData.currentSection || 1;
            
            // Restore form values
            Object.entries(savedData).forEach(([key, value]) => {
                if (key !== 'currentSection' && key !== 'timestamp') {
                    this.restoreFieldValue(key, value);
                }
            });
            
            this.showSection(this.currentSection);
            this.updateProgress();
            
            console.log('Form data restored from localStorage');
        }
    }

    restoreFieldValue(name, value) {
        const field = document.querySelector(`[name="${name}"]`);
        if (!field) return;

        if (field.type === 'radio') {
            const specificField = document.querySelector(`[name="${name}"][value="${value}"]`);
            if (specificField) {
                specificField.checked = true;
                this.updateRadioSelection(name);
            }
        } else if (field.type === 'checkbox') {
            if (Array.isArray(value)) {
                value.forEach(val => {
                    const checkbox = document.querySelector(`[name="${name}"][value="${val}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        this.updateCheckboxSelection(name);
                    }
                });
            }
        } else if (field.type === 'hidden') {
            field.value = value;
            // Update visual rating button
            const ratingBtn = document.querySelector(`[data-name="${name}"][data-value="${value}"]`);
            if (ratingBtn) {
                ratingBtn.classList.add('selected');
                ratingBtn.setAttribute('aria-pressed', 'true');
            }
        } else {
            field.value = value;
        }
    }

    collectAllFormData() {
        // Define all expected fields with their sections
        const allFields = {
            contact: ['contact_001', 'contact_002', 'contact_003', 'contact_004', 'contact_005'],
            location: ['location_001', 'location_002', 'location_003', 'location_004', 'location_005'],
            budget: ['budget_001', 'budget_002', 'budget_003'],
            care: ['care_001', 'care_002', 'care_003', 'care_004', 
                   'care_005_bathing', 'care_005_dressing', 'care_005_eating', 
                   'care_005_toilet', 'care_005_mobility', 'care_005_medication', 'care_006'],
            culture: ['culture_001', 'culture_002', 'culture_003', 'culture_004'],
            comfort: ['comfort_001', 'comfort_002', 'comfort_003', 'comfort_004',
                     'comfort_005', 'comfort_006', 'comfort_007', 'comfort_008'],
            family: ['family_001', 'family_002', 'family_003', 'family_004'],
            timeline: ['timeline_001', 'timeline_002', 'timeline_003', 'timeline_004',
                      'timeline_005', 'timeline_006', 'timeline_007', 'timeline_008'],
            system: ['system_001', 'system_002']
        };
        
        const structuredData = {};
        let totalFieldsProcessed = 0;
        let filledFields = 0;
        
        // Process each section
        Object.entries(allFields).forEach(([sectionName, fieldNames]) => {
            structuredData[sectionName] = {};
            
            fieldNames.forEach(fieldName => {
                totalFieldsProcessed++;
                let value = null;
                
                const field = document.querySelector(`[name="${fieldName}"]`);
                
                if (field) {
                    if (field.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${fieldName}"]:checked`);
                        value = checkedRadio ? checkedRadio.value : null;
                    } else if (field.type === 'checkbox') {
                        const checkedBoxes = document.querySelectorAll(`[name="${fieldName}"]:checked`);
                        value = Array.from(checkedBoxes).map(box => box.value);
                        if (value.length === 0) value = null;
                    } else if (field.type === 'hidden') {
                        value = field.value || null;
                    } else {
                        value = field.value.trim() || null;
                    }
                }
                
                // Count non-null values
                if (value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                    filledFields++;
                }
                
                structuredData[sectionName][fieldName] = value;
            });
        });
        
        // Add completion statistics
        structuredData._statistics = {
            total_fields: totalFieldsProcessed,
            filled_fields: filledFields,
            completion_rate: Math.round((filledFields / totalFieldsProcessed) * 100),
            sections_completed: this.totalSections,
            form_duration_minutes: Math.round((Date.now() - this.startTime) / 60000)
        };
        
        console.log('Data Collection Summary:', structuredData._statistics);
        
        return structuredData;
    }

    async submitForm(e) {
        e.preventDefault();
        
        if (!this.validateCurrentSection()) {
            return;
        }
        
        // Collect ALL form data
        const allFormData = this.collectAllFormData();
        
        // Add metadata
        const finalData = {
            assessment_data: allFormData,
            meta: {
                timestamp: new Date().toISOString(),
                assessment_version: '1.0',
                user_agent: navigator.userAgent,
                screen_resolution: `${screen.width}x${screen.height}`,
                completed_sections: this.totalSections,
                submission_id: 'RCH-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                form_duration_minutes: Math.round((Date.now() - this.startTime) / 60000),
                total_fields: Object.keys(allFormData).length
            }
        };
        
        // Show loading state
        const submitBtn = document.getElementById('submit-btn');
        let originalText = submitBtn.innerHTML;
        if (window.CareHomeUtils) {
            originalText = window.CareHomeUtils.showLoading(submitBtn);
        }
        
        try {
            const response = await this.sendToAPI(finalData);
            console.log('Submission successful:', response);
            
            this.showThankYouPage();
            if (window.CareHomeUtils) {
                window.CareHomeUtils.removeFromStorage(this.storageKey);
            }
            
            // Track completion
            if (window.CareHomeUtils) {
                window.CareHomeUtils.trackEvent('assessment_completed', {
                    sections: this.totalSections,
                    duration_minutes: finalData.meta.form_duration_minutes,
                    completion_rate: finalData.assessment_data._statistics.completion_rate
                });
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            if (window.CareHomeUtils) {
                window.CareHomeUtils.hideLoading(submitBtn, originalText);
                window.CareHomeUtils.showNotification('Sorry, there was an error submitting your assessment. Please try again.', 'error');
            }
        }
    }

    async sendToAPI(data) {
        console.log('Assessment submission started');
        console.log('Complete data:', data);
        console.log('Data size:', new Blob([JSON.stringify(data)]).size + ' bytes');
        
        // Simulate API call for development
        console.log('Simulating server processing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = {
            success: true,
            assessment_id: data.meta.submission_id,
            message: 'Assessment submitted successfully',
            timestamp: new Date().toISOString(),
            next_steps: {
                confirmation_email: 'Within 2 hours',
                expert_analysis: 'Within 24 hours',
                recommendations_delivery: 'Within 48 hours'
            }
        };
        
        console.log('Simulated server response:', response);
        return response;
    }

    showThankYouPage() {
        console.log('Assessment completed, redirecting...');
        
        const assessmentId = Date.now().toString().slice(-6);
        localStorage.setItem('assessmentId', assessmentId);
        
        const redirectUrl = `thank-you.html?completed=true&ref=RCH-2025-${assessmentId}`;
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
        
        console.log(`Redirecting to: ${redirectUrl}`);
    }
}

// Initialize questionnaire when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the questionnaire page
    if (document.getElementById('questionnaire-form')) {
        window.careHomeQuestionnaire = new CareHomeQuestionnaire();
    }
});

// Export for testing
window.CareHomeQuestionnaire = CareHomeQuestionnaire;