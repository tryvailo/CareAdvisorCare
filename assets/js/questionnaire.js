// questionnaire.js - Care Home Questionnaire functionality

class CareHomeQuestionnaire {
    constructor() {
        this.currentSection = 1;
        this.totalSections = 8;
        this.formData = {};
        this.startTime = Date.now(); // Track form start time
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadSavedData();
        this.addAccessibilityFeatures();
        
        // Initialize sections visibility
        this.showSection(1);
    }

    addAccessibilityFeatures() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('rating-btn')) {
                e.target.click();
            }
        });
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextSection());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSection());
        
        // Form submission
        document.getElementById('questionnaire-form').addEventListener('submit', (e) => this.submitForm(e));
        
        // Radio and checkbox interactions
        this.setupRadioButtons();
        this.setupCheckboxes();
        this.setupRatingButtons();
        this.setupConditionalLogic();
        
        // Auto-save on input
        document.addEventListener('input', () => this.saveFormData());
    }

    setupRadioButtons() {
        document.querySelectorAll('.radio-option').forEach(option => {
            option.addEventListener('click', () => {
                const input = option.querySelector('input[type="radio"]');
                if (input && !input.disabled) {
                    input.checked = true;
                    this.updateRadioSelection(input.name);
                    this.saveFormData();
                }
            });
        });
    }

    setupCheckboxes() {
        document.querySelectorAll('.checkbox-option').forEach(option => {
            option.addEventListener('click', () => {
                const input = option.querySelector('input[type="checkbox"]');
                if (input && !input.disabled) {
                    input.checked = !input.checked;
                    this.updateCheckboxSelection(input.name);
                    this.saveFormData();
                }
            });
        });
    }

    setupRatingButtons() {
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = btn.dataset.name;
                const value = btn.dataset.value;
                
                // Clear previous selections
                document.querySelectorAll(`[data-name="${name}"]`).forEach(b => {
                    b.classList.remove('selected');
                });
                
                // Select current
                btn.classList.add('selected');
                
                // Update hidden input
                const hiddenInput = document.querySelector(`input[name="${name}"]`);
                if (hiddenInput) {
                    hiddenInput.value = value;
                }
                
                // Announce selection for screen readers
                const announcement = `Selected ${value}`;
                btn.setAttribute('aria-label', announcement);
                
                this.saveFormData();
            });
        });
    }

    setupConditionalLogic() {
        // Show/hide patient name based on relationship
        const relationshipInputs = document.querySelectorAll('input[name="contact_004"]');
        const patientNameSection = document.getElementById('patient-name-section');
        const patientNameInput = document.getElementById('contact_005');

        relationshipInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === 'myself') {
                    patientNameSection.style.display = 'none';
                    patientNameInput.removeAttribute('required');
                } else {
                    patientNameSection.style.display = 'block';
                    patientNameInput.setAttribute('required', 'required');
                }
            });
        });

        // Show/hide other language field
        const languageInputs = document.querySelectorAll('input[name="culture_001"]');
        const otherLanguageSection = document.getElementById('other-language-section');

        languageInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === 'other_language') {
                    otherLanguageSection.style.display = 'block';
                } else {
                    otherLanguageSection.style.display = 'none';
                }
            });
        });
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }
    
    showMilestoneMessage() {
        // Create celebration message
        const celebration = document.createElement('div');
        celebration.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-xl shadow-2xl z-50 text-center max-w-md';
        celebration.innerHTML = `
            <div class="text-3xl mb-2">🎉</div>
            <h3 class="text-xl font-bold mb-2">Halfway Complete!</h3>
            <p class="text-sm">Your profile is already much more detailed than any free service. The AI is building a comprehensive picture of your needs.</p>
        `;
        
        document.body.appendChild(celebration);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            celebration.style.opacity = '0';
            celebration.style.transform = 'translate(-50%, -100%) scale(0.9)';
            celebration.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                celebration.remove();
            }, 500);
        }, 3500);
    }

    prevSection() {
        if (this.currentSection > 1) {
            this.currentSection--;
            this.showSection(this.currentSection);
            this.updateProgress();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.parentNode.appendChild(errorDiv);
        } else {
            element.appendChild(errorDiv);
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
        
        let title, subtitle;
        
        if (this.currentSection === 1) {
            title = "Ready to begin your personalised care home assessment";
            subtitle = "Each answer helps our AI create more accurate recommendations just for you";
        } else if (this.currentSection === 2) {
            title = "Excellent! Each answer makes your recommendations more personalised";
            subtitle = "Location preferences help us find care homes in the right area for your family";
        } else if (this.currentSection === 3) {
            title = "Brilliant progress! Budget information ensures realistic recommendations";
            subtitle = "No hidden costs - we'll show you exactly what to expect financially";
        } else if (this.currentSection === 4) {
            title = "Halfway there! Your profile is already far more detailed than any free service";
            subtitle = "Medical needs are crucial - this ensures we find homes with the right expertise";
        } else if (this.currentSection === 5) {
            title = "Outstanding! Cultural preferences make a real difference to daily comfort";
            subtitle = "Language and religious needs often determine long-term happiness in care";
        } else if (this.currentSection === 6) {
            title = "Nearly finished! Comfort preferences create truly personalised matches";
            subtitle = "Activities and lifestyle choices help identify homes where you'll feel at home";
        } else if (this.currentSection === 7) {
            title = "Almost there! Family involvement shapes your care experience significantly";
            subtitle = "Visiting arrangements and family support are essential for peace of mind";
        } else if (this.currentSection === 8) {
            title = "Final section! Your comprehensive profile is ready for AI analysis";
            subtitle = "Timeline and additional details complete your unique care home requirements";
        }
        
        motivationDiv.innerHTML = `
            <p class="text-lg font-semibold text-blue-800">${title}</p>
            <p class="text-gray-600 mt-2">${subtitle}</p>
        `;
        
        // Update styling based on progress
        if (progress >= 50) {
            motivationDiv.className = 'text-center mb-8 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200';
        }
        
        if (progress >= 75) {
            motivationDiv.className = 'text-center mb-8 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-green-50 border border-orange-200';
        }
    }

    saveFormData() {
        const formData = new FormData(document.getElementById('questionnaire-form'));
        const data = Object.fromEntries(formData);
        
        // Add metadata
        data.currentSection = this.currentSection;
        data.timestamp = new Date().toISOString();
        
        // Save to localStorage with 24-hour expiry
        const saveData = {
            ...data,
            expiry: Date.now() + (24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('careHomeQuestionnaire', JSON.stringify(saveData));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('careHomeQuestionnaire');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Check if data hasn't expired
                if (Date.now() < data.expiry) {
                    this.formData = data;
                    this.currentSection = data.currentSection || 1;
                    
                    // Restore form values
                    Object.entries(data).forEach(([key, value]) => {
                        if (key !== 'currentSection' && key !== 'timestamp' && key !== 'expiry') {
                            const field = document.querySelector(`[name="${key}"]`);
                            if (field) {
                                if (field.type === 'radio' || field.type === 'checkbox') {
                                    const specificField = document.querySelector(`[name="${key}"][value="${value}"]`);
                                    if (specificField) {
                                        specificField.checked = true;
                                        this.updateRadioSelection(key);
                                    }
                                } else {
                                    field.value = value;
                                }
                            }
                        }
                    });
                    
                    this.showSection(this.currentSection);
                    this.updateProgress();
                } else {
                    // Data expired, remove it
                    localStorage.removeItem('careHomeQuestionnaire');
                }
            } catch (e) {
                console.warn('Could not restore saved data', e);
                localStorage.removeItem('careHomeQuestionnaire');
            }
        }
    }

    submitForm(e) {
        e.preventDefault();
        
        if (this.validateCurrentSection()) {
            // Collect ALL form fields (including empty ones)
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
                    form_duration_minutes: Math.round((Date.now() - (this.startTime || Date.now())) / 60000),
                    total_fields: Object.keys(allFormData).length
                }
            };
            
            // Show loading state
            const submitBtn = document.getElementById('submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';
            submitBtn.disabled = true;
            
            // Send data to API
            this.sendToAPI(finalData).then((response) => {
                console.log('✅ Submission successful:', response);
                this.showThankYouPage();
                localStorage.removeItem('careHomeQuestionnaire');
            }).catch((error) => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                this.showErrorMessage('Sorry, there was an error submitting your assessment. Please try again.');
                console.error('⚠️ Submission error:', error);
            });
        }
    }

    collectAllFormData() {
        // Define all 50 expected fields with their sections
        const allFields = {
            // Section 1: Contact Information (5 fields)
            contact: ['contact_001', 'contact_002', 'contact_003', 'contact_004', 'contact_005'],
            
            // Section 2: Location Preferences (5 fields)
            location: ['location_001', 'location_002', 'location_003', 'location_004', 'location_005'],
            
            // Section 3: Budget & Funding (3 fields)
            budget: ['budget_001', 'budget_002', 'budget_003'],
            
            // Section 4: Care Type & Medical Needs (11 fields)
            care: ['care_001', 'care_002', 'care_003', 'care_004', 
                   'care_005_bathing', 'care_005_dressing', 'care_005_eating', 
                   'care_005_toilet', 'care_005_mobility', 'care_005_medication', 'care_006'],
            
            // Section 5: Cultural & Language Preferences (4 fields)
            culture: ['culture_001', 'culture_002', 'culture_003', 'culture_004'],
            
            // Section 6: Comfort & Activities (8 fields)
            comfort: ['comfort_001', 'comfort_002', 'comfort_003', 'comfort_004',
                     'comfort_005', 'comfort_006', 'comfort_007', 'comfort_008'],
            
            // Section 7: Family & Visiting (4 fields)
            family: ['family_001', 'family_002', 'family_003', 'family_004'],
            
            // Section 8: Timeline & Additional Information (8 fields)
            timeline: ['timeline_001', 'timeline_002', 'timeline_003', 'timeline_004',
                      'timeline_005', 'timeline_006', 'timeline_007', 'timeline_008'],
            
            // System fields (2 fields)
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
                
                // Try to find the field
                const field = document.querySelector(`[name="${fieldName}"]`);
                
                if (field) {
                    if (field.type === 'radio') {
                        // For radio buttons, get the checked value
                        const checkedRadio = document.querySelector(`[name="${fieldName}"]:checked`);
                        value = checkedRadio ? checkedRadio.value : null;
                        
                    } else if (field.type === 'checkbox') {
                        // For checkboxes, get all checked values as array
                        const checkedBoxes = document.querySelectorAll(`[name="${fieldName}"]:checked`);
                        value = Array.from(checkedBoxes).map(box => box.value);
                        
                    } else if (field.type === 'hidden') {
                        // For hidden fields (rating scales)
                        value = field.value || null;
                        
                    } else {
                        // For text, email, textarea fields
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
            form_duration_minutes: Math.round((Date.now() - (this.startTime || Date.now())) / 60000)
        };
        
        console.log(`📊 Data Collection Summary:`);
        console.log(`   Total Fields: ${totalFieldsProcessed}`);
        console.log(`   Filled Fields: ${filledFields}`);
        console.log(`   Completion Rate: ${structuredData._statistics.completion_rate}%`);
        console.log(`   Form Duration: ${structuredData._statistics.form_duration_minutes} minutes`);
        
        return structuredData;
    }

    async sendToAPI(data) {
        // 📊 DATA COLLECTION: Complete JSON structure ready for n8n
        console.log('🎯 ASSESSMENT SUBMISSION STARTED');
        console.log('📋 Complete Assessment Data (JSON):');
        console.log(JSON.stringify(data, null, 2));
        console.log('📈 Data size:', new Blob([JSON.stringify(data)]).size + ' bytes');
        console.log('📢 Total fields collected:', data.meta.total_fields);
        console.log('⏱️ Form completion time:', data.meta.form_duration_minutes + ' minutes');
        
        // 🧪 DEVELOPMENT SIMULATION (2-second delay + realistic response)
        console.log('⏳ Simulating server processing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate realistic API response
        const response = {
            success: true,
            assessment_id: data.meta.submission_id,
            message: 'Assessment submitted successfully to n8n workflow',
            timestamp: new Date().toISOString(),
            next_steps: {
                confirmation_email: 'Within 2 hours',
                expert_analysis: 'Within 24 hours',
                recommendations_delivery: 'Within 48 hours'
            },
            data_summary: {
                fields_received: data.meta.total_fields,
                required_fields_complete: true,
                processing_status: 'queued'
            }
        };
        
        console.log('✅ Simulated server response:', response);
        return response;
    }

    showThankYouPage() {
        console.log('🎉 Completing assessment and redirecting...');
        
        // Generate unique assessment ID
        const assessmentId = Date.now().toString().slice(-6);
        
        // Store assessment ID for potential use
        localStorage.setItem('assessmentId', assessmentId);
        
        // Redirect to thank you page with parameters
        const redirectUrl = `thank-you.html?completed=true&ref=RCH-2025-${assessmentId}`;
        
        // Add slight delay for better UX (shows loading state)
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1000);
        
        console.log(`✅ Redirecting to: ${redirectUrl}`);
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'success-notification';
        errorDiv.style.background = '#dc2626';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize questionnaire when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CareHomeQuestionnaire();
});