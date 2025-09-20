// main.js - Main JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced fade in animation observer
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

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Area selector functionality - Navigate to regional pages
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            const selectedArea = this.value;
            if (selectedArea === 'birmingham') {
                // Navigate to the Birmingham regional page
                window.location.href = '/birmingham/';
            } else if (selectedArea && selectedArea !== '' && !this.options[this.selectedIndex].disabled) {
                // Navigate to other area pages when available
                window.location.href = `/${selectedArea}/`;
            }
        });
    });

    // Enhanced button interactions for area cards
    document.querySelectorAll('.area-card').forEach(card => {
        const button = card.querySelector('button');
        if (button && button.textContent.includes('Birmingham')) {
            // Make entire card clickable
            card.addEventListener('click', function(e) {
                e.preventDefault();
                // Add click animation before navigation
                this.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    window.location.href = '/birmingham/';
                }, 150);
            });

            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Add click animation before navigation
                this.style.transform = 'scale(0.98)';
                
                setTimeout(() => {
                    window.location.href = '/birmingham/';
                }, 150);
            });
        }
    });

    // Enhanced form submission with validation for guide form
    const guideForms = document.querySelectorAll('.guide-form, form');
    guideForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = form.querySelector('input[type="email"]');
            const areaSelect = form.querySelector('select');
            
            if (!emailInput || !areaSelect) return;
            
            const email = emailInput.value;
            const area = areaSelect.value;
            
            // Validation
            if (!email || !email.includes('@') || !area) {
                showNotification('Please fill in all fields correctly', 'error');
                return;
            }
            
            // Success animation
            const button = form.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Sending...';
            button.disabled = true;
            
            // Simulate sending
            setTimeout(() => {
                button.textContent = '✓ Sent! Check your email';
                button.style.background = '#059669';
                showNotification('Free guide sent to your email!', 'success');
            }, 1000);
            
            // Reset form
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.background = '';
                form.reset();
            }, 3000);
        });
    });

    // Primary CTA button clicks
    document.querySelectorAll('.primary-cta').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if this is a report purchase button
            if (this.textContent.includes('Report') || this.textContent.includes('£99')) {
                // Navigate to questionnaire or checkout
                showNotification('Redirecting to questionnaire...', 'info');
                setTimeout(() => {
                    window.location.href = '/questionnaire/';
                }, 1000);
            } else if (this.textContent.includes('Premium') || this.textContent.includes('£149')) {
                // Navigate to premium service
                showNotification('Redirecting to premium service...', 'info');
                setTimeout(() => {
                    window.location.href = '/premium/';
                }, 1000);
            }
        });
    });

    // Secondary CTA button clicks (Free Guide)
    document.querySelectorAll('.secondary-cta').forEach(button => {
        if (button.textContent.includes('Guide') || button.textContent.includes('Free')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Scroll to guide form or trigger modal
                const guideForm = document.querySelector('.guide-form');
                if (guideForm) {
                    guideForm.scrollIntoView({ behavior: 'smooth' });
                    // Focus on email input
                    setTimeout(() => {
                        const emailInput = guideForm.querySelector('input[type="email"]');
                        if (emailInput) emailInput.focus();
                    }, 500);
                }
            });
        }
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');
    if (header) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
            
            // Hide header on scroll down, show on scroll up
            if (window.scrollY > lastScrollY && window.scrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = window.scrollY;
        });
    }

    // FAQ functionality (if present)
    document.querySelectorAll('.faq-button').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.parentNode.querySelector('.faq-content');
            const icon = this.querySelector('.faq-icon');
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Close other open FAQs
                document.querySelectorAll('.faq-content.show').forEach(openContent => {
                    openContent.classList.remove('show');
                    const openIcon = openContent.parentNode.querySelector('.faq-icon');
                    openIcon.style.transform = 'rotate(0deg)';
                });
                
                content.classList.add('show');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Testimonial carousel (if multiple testimonials)
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (testimonialCards.length > 3) {
        let currentTestimonial = 0;
        
        // Hide testimonials beyond the first 3
        testimonialCards.forEach((card, index) => {
            if (index >= 3) {
                card.style.display = 'none';
            }
        });
        
        // Add navigation if needed
        const testimonialSection = document.querySelector('.testimonials-grid').parentNode;
        const navHTML = `
            <div class="testimonial-nav text-center mt-8">
                <button class="testimonial-prev px-4 py-2 bg-gray-200 rounded-lg mr-4">Previous</button>
                <button class="testimonial-next px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
            </div>
        `;
        testimonialSection.insertAdjacentHTML('beforeend', navHTML);
    }

    // Mobile menu toggle (if mobile menu exists)
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Animate hamburger icon
            const icon = this.querySelector('svg');
            if (icon) {
                icon.style.transform = mobileMenu.classList.contains('hidden') 
                    ? 'rotate(0deg)' 
                    : 'rotate(90deg)';
            }
        });
    }

    // Pricing card hover effects enhancement
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('recommended')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
            }
        });
    });

    // Form field enhancements
    document.querySelectorAll('.form-input, .area-selector').forEach(input => {
        // Add focus/blur animations
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
            if (this.value) {
                this.parentNode.classList.add('filled');
            } else {
                this.parentNode.classList.remove('filled');
            }
        });
        
        // Check if already filled on page load
        if (input.value) {
            input.parentNode.classList.add('filled');
        }
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm ${getNotificationClass(type)}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-3">${getNotificationIcon(type)}</span>
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
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
    }
    
    function getNotificationClass(type) {
        switch(type) {
            case 'success': return 'bg-green-500 text-white';
            case 'error': return 'bg-red-500 text-white';
            case 'warning': return 'bg-yellow-500 text-white';
            default: return 'bg-blue-500 text-white';
        }
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    }

    // Loading state for buttons
    function setButtonLoading(button, loading = true) {
        if (loading) {
            button.originalText = button.textContent;
            button.disabled = true;
            button.innerHTML = `
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Loading...
            `;
        } else {
            button.disabled = false;
            button.textContent = button.originalText || button.textContent;
        }
    }

    // Initialize tooltips (if any)
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute bg-gray-800 text-white px-2 py-1 rounded text-sm z-50';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.top = this.offsetTop - 30 + 'px';
            tooltip.style.left = this.offsetLeft + 'px';
            this.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.absolute.bg-gray-800');
            if (tooltip) tooltip.remove();
        });
    });

    // Performance optimizations
    let ticking = false;
    
    function updateOnScroll() {
        // Batch DOM updates
        requestAnimationFrame(() => {
            // Update scroll-based animations here
            ticking = false;
        });
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            updateOnScroll();
        }
    });

    // Initialize everything
    console.log('RightCareHome UI initialized successfully');
    
    // Analytics tracking (placeholder)
    function trackEvent(category, action, label) {
        // Add Google Analytics or other tracking here
        console.log('Event tracked:', { category, action, label });
    }
    
    // Track important interactions
    document.querySelectorAll('.primary-cta').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('CTA', 'click', button.textContent);
        });
    });

});