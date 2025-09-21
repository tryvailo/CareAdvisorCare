/**
 * thank-you.js - Thank you page functionality
 * Integrated with existing project structure
 */

class ThankYouPage {
    constructor() {
        this.init();
    }

    init() {
        // Enhanced fade in animation
        this.initAnimations();
        
        // Generate and display reference number
        this.generateReferenceNumber();
        
        // Handle URL parameters
        this.handleURLParameters();
        
        // Auto-trigger animations
        this.triggerAnimations();
        
        console.log('ThankYouPage initialized');
    }

    initAnimations() {
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

    generateReferenceNumber() {
        // Generate reference number using the main utility if available
        let refNumber;
        if (window.CareHomeUtils) {
            refNumber = window.CareHomeUtils.generateReferenceNumber();
        } else {
            refNumber = 'RCH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        }
        
        const refElement = document.getElementById('reference-number');
        if (refElement) {
            refElement.textContent = refNumber;
        }
        
        // Also update any other reference displays
        document.querySelectorAll('.reference-display').forEach(el => {
            el.textContent = refNumber;
        });
    }

    handleURLParameters() {
        let urlParams;
        if (window.CareHomeUtils) {
            urlParams = window.CareHomeUtils.getUrlParams();
        } else {
            urlParams = new URLSearchParams(window.location.search);
        }
        
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
            this.trackCompletion(urlParams.get('ref'));
            
            // Show success notification after a delay
            setTimeout(() => {
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.showNotification('Assessment submitted successfully! Check your email for confirmation.');
                } else {
                    this.showNotification('Assessment submitted successfully! Check your email for confirmation.');
                }
            }, 1000);
        }
    }

    trackCompletion(referenceNumber) {
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
        
        // Track with main analytics if available
        if (window.CareHomeUtils) {
            window.CareHomeUtils.trackEvent('assessment_completion', completionData);
        }
    }

    triggerAnimations() {
        setTimeout(() => {
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
        }, 200);
    }

    // Fallback notification system if main utils not available
    showNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm';
        
        // Set background based on type
        switch(type) {
            case 'success':
                notification.style.background = '#059669';
                notification.style.color = 'white';
                break;
            case 'error':
                notification.style.background = '#dc2626';
                notification.style.color = 'white';
                break;
            default:
                notification.style.background = '#2563eb';
                notification.style.color = 'white';
        }
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-3">${type === 'success' ? '✓' : 'ℹ'}</span>
                <span class="font-medium">${message}</span>
                <button class="ml-4 text-lg leading-none" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Slide in animation
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
            notification.style.transition = 'all 0.3s ease';
        }, 100);
    }

    // Initialize download tracking for resources
    initResourceTracking() {
        document.querySelectorAll('a[href$=".pdf"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const resourceName = link.href.split('/').pop();
                
                // Track download
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.trackEvent('resource_download', {
                        resource: resourceName,
                        page: 'thank_you'
                    });
                }
                
                console.log('Resource download tracked:', resourceName);
            });
        });
    }

    // Initialize email clicks tracking
    initEmailTracking() {
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.trackEvent('email_click', {
                        email: link.href.replace('mailto:', ''),
                        page: 'thank_you'
                    });
                }
            });
        });
    }

    // Add print functionality for the thank you page
    initPrintFunction() {
        const printBtn = document.getElementById('print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
                
                if (window.CareHomeUtils) {
                    window.CareHomeUtils.trackEvent('page_print', {
                        page: 'thank_you'
                    });
                }
            });
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the thank you page
    if (document.querySelector('.thank-you-page') || 
        document.querySelector('#reference-number') || 
        window.location.pathname.includes('thank-you')) {
        
        const thankYouPage = new ThankYouPage();
        
        // Initialize additional features
        thankYouPage.initResourceTracking();
        thankYouPage.initEmailTracking();
        thankYouPage.initPrintFunction();
        
        // Store instance globally for potential access
        window.thankYouPageInstance = thankYouPage;
    }
});

// Export functions for potential external use
window.ThankYouPage = {
    generateReferenceNumber: function() {
        if (window.CareHomeUtils) {
            return window.CareHomeUtils.generateReferenceNumber();
        }
        return 'RCH-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    },
    
    trackCompletion: function(referenceNumber) {
        const completionData = {
            timestamp: new Date().toISOString(),
            reference: referenceNumber || 'unknown',
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            completion_source: 'questionnaire'
        };
        
        console.log('Assessment completion tracked:', completionData);
        localStorage.setItem('lastCompletionData', JSON.stringify(completionData));
        
        if (window.CareHomeUtils) {
            window.CareHomeUtils.trackEvent('assessment_completion', completionData);
        }
    }
};