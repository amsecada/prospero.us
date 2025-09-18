// Mobile navigation toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;
    
    if (!mobileToggle || !mobileNav) return;
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        
        // Update ARIA attributes
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNav.setAttribute('aria-hidden', isExpanded);
        
        // Toggle menu visibility
        if (!isExpanded) {
            // Open menu
            mobileNav.style.display = 'block';
            setTimeout(() => {
                mobileNav.classList.add('mobile-nav--open');
            }, 10);
            body.style.overflow = 'hidden';
        } else {
            // Close menu
            mobileNav.classList.remove('mobile-nav--open');
            body.style.overflow = '';
            
            // Wait for transition to complete before hiding
            setTimeout(() => {
                if (mobileToggle.getAttribute('aria-expanded') === 'false') {
                    mobileNav.style.display = 'none';
                }
            }, 300);
        }
    }
    
    // Add click event to mobile toggle
    mobileToggle.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on links
    const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            mobileNav.classList.remove('mobile-nav--open');
            body.style.overflow = '';
            
            setTimeout(() => {
                mobileNav.style.display = 'none';
            }, 300);
        });
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && mobileToggle.getAttribute('aria-expanded') === 'true') {
            toggleMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileToggle.getAttribute('aria-expanded') === 'true' &&
            !mobileNav.contains(event.target) &&
            !mobileToggle.contains(event.target)) {
            toggleMobileMenu();
        }
    });
    
    // Add CSS class for open state (for potential animations)
    const style = document.createElement('style');
    style.textContent = `
        .mobile-nav--open {
            transform: translateX(0) !important;
        }
    `;
    document.head.appendChild(style);
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const href = this.getAttribute('href');
            
            // Only handle anchor links that point to elements on the page
            if (href !== '#' && href.startsWith('#')) {
                const target = document.querySelector(href);
                
                if (target) {
                    event.preventDefault();
                    
                    // Calculate offset for sticky header
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// Add loading class to body for potential loading states
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
});

// Simple error handling for images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Image failed to load:', this.src);
            this.style.display = 'none';
        });
    });
});
