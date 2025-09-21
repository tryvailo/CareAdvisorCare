// thank-you.js - Thank you page functionality

document.addEventListener('DOMContentLoaded', () => {
    initThankYouPage();
});

function initThankYouPage() {
    // Enhanced fade in animation
    initAnimations();
    
    // Generate and display reference number
    generateReferenceNumber();
    
    // Handle URL parameters
    handleURLParameters();
    
    // Auto-trigger animations
    triggerAnimations();
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function generateReferenceNumber() {
    // Generate reference number
    const refNumber = 'RCH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const refElement = document.getElementById('reference-number');
    if (refElement) {
        refElement.textContent = refNumber;
    }
}

function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('completed') === 'true') {
        // Show completion-specific content or tracking
        console.log('Assessment completed successfully');
        
        // Optional: Send analytics event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'assessment_completed', {
                'event_category': 'conversion',
                'event_label': 'care_home_assessment'
            });
        }
        
        // Track the completion for internal analytics
        trackCompletion(urlParams.get('ref'));
    }
}

function trackCompletion(referenceNumber) {
    // Log completion data
    const completionData = {
        timestamp: new Date().toISOString(),
        reference: referenceNumber || 'unknown',
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        completion_source: 'questionnaire'
    };
    
    console.log('Assessment completion tracked:', completionData);
    
    // Store completion data locally for potential future use
    localStorage.setItem('lastCompletionData', JSON.stringify(completionData));
}

function triggerAnimations() {
    setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 200);
}

// Export functions for potential external use
window.ThankYouPage = {
    initThankYouPage,
    generateReferenceNumber,
    handleURLParameters,
    trackCompletion
};