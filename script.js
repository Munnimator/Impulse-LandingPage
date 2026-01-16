// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

mobileMenuToggle?.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// Show mobile menu when active
const style = document.createElement('style');
style.textContent = `
    .mobile-menu.active {
        display: block;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
`;
document.head.appendChild(style);

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = 72;
        const sectionTop = section.offsetTop - navHeight;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// Handle anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const sectionId = this.getAttribute('href').substring(1);
        scrollToSection(sectionId);
    });
});

// Floating CTA on Scroll
const floatingCta = document.getElementById('floating-cta');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Show floating CTA after scrolling past hero
    if (scrollTop > 600) {
        floatingCta?.classList.add('visible');
    } else {
        floatingCta?.classList.remove('visible');
    }
});

// Interactive Calculator
const impulsesPerWeek = document.getElementById('impulses-per-week');
const averageAmount = document.getElementById('average-amount');
const monthlySavings = document.getElementById('monthly-savings');
const yearlySavings = document.getElementById('yearly-savings');

function calculateSavings() {
    const weekly = parseInt(impulsesPerWeek?.value || 3);
    const amount = parseInt(averageAmount?.value || 25);
    
    const monthly = weekly * 4.33 * amount; // 4.33 weeks per month average
    const yearly = weekly * 52 * amount;
    
    if (monthlySavings) {
        monthlySavings.textContent = `$${Math.round(monthly).toLocaleString()}`;
    }
    
    if (yearlySavings) {
        yearlySavings.textContent = `$${Math.round(yearly).toLocaleString()}`;
    }
    
    // Add pulse animation on calculation
    yearlySavings?.parentElement.classList.add('pulse');
    setTimeout(() => {
        yearlySavings?.parentElement.classList.remove('pulse');
    }, 600);
}

// Add pulse animation style
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 0.6s ease-out;
    }
`;
document.head.appendChild(pulseStyle);

// Listen for calculator input changes
impulsesPerWeek?.addEventListener('input', calculateSavings);
averageAmount?.addEventListener('input', calculateSavings);

// Initialize calculator
calculateSavings();


// Generate QR Code
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
        const appStoreUrl = 'https://apps.apple.com/app/impulselog';
        
        // Use Google Charts API to generate QR code
        const qrCodeUrl = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(appStoreUrl)}&choe=UTF-8&chld=M|2`;
        
        qrContainer.innerHTML = `
            <div style="width: 150px; height: 150px; background: white; border-radius: 8px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <img src="${qrCodeUrl}" alt="QR Code for App Store download" style="width: 100%; height: 100%; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; text-align: center; color: #6B7280; font-size: 12px;">
                    QR Code<br>Coming Soon
                </div>
            </div>
        `;
    }
}

// Initialize QR code on load
generateQRCode();

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Add hover effects to cards
document.querySelectorAll('.value-card, .pricing-card, .faq-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Stats Counter Animation
function animateStats() {
    const stats = [
        { element: document.querySelector('.stat-value'), target: 47392, prefix: '$' },
        { element: document.querySelectorAll('.stat-value')[1], target: 2.3, suffix: 'M' },
        { element: document.querySelectorAll('.stat-value')[2], target: 10, suffix: 'K+' }
    ];
    
    stats.forEach(stat => {
        if (!stat.element) return;
        
        let current = 0;
        const increment = stat.target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
                current = stat.target;
                clearInterval(timer);
            }
            
            const value = current < 10 ? current.toFixed(1) : Math.round(current);
            stat.element.textContent = 
                (stat.prefix || '') + 
                value.toLocaleString() + 
                (stat.suffix || '');
        }, 30);
    });
}

// Trigger stats animation when visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateStats();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Prevent form submission on demo calculator
document.querySelectorAll('form').forEach(form => {
    if (!form.id || form.id !== 'waitlist-form') {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
});

// Screenshot Carousel
const screenshotDots = document.querySelectorAll('.nav-dot');
const screenshotWrappers = document.querySelectorAll('.screenshot-wrapper');

function showScreenshot(screenNumber) {
    // Remove active class from all
    screenshotDots.forEach(dot => dot.classList.remove('active'));
    screenshotWrappers.forEach(wrapper => wrapper.classList.remove('active'));
    
    // Add active class to selected
    const selectedDot = document.querySelector(`.nav-dot[data-screen="${screenNumber}"]`);
    const selectedWrapper = document.querySelector(`.screenshot-wrapper[data-screen="${screenNumber}"]`);
    
    if (selectedDot && selectedWrapper) {
        selectedDot.classList.add('active');
        selectedWrapper.classList.add('active');
    }
}

// Add click handlers to dots
screenshotDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const screenNumber = dot.getAttribute('data-screen');
        showScreenshot(screenNumber);
    });
});

// Auto-rotate screenshots every 5 seconds
let currentScreen = 1;
const totalScreens = screenshotWrappers.length || 6; // Dynamic count from DOM

let carouselInterval = setInterval(() => {
    currentScreen = currentScreen >= totalScreens ? 1 : currentScreen + 1;
    showScreenshot(currentScreen);
}, 5000);

// Pause carousel when page is not visible (prevents memory leak)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(carouselInterval);
    } else {
        carouselInterval = setInterval(() => {
            currentScreen = currentScreen >= totalScreens ? 1 : currentScreen + 1;
            showScreenshot(currentScreen);
        }, 5000);
    }
});

// Touch/swipe support for mobile
let touchStartX = null;
const screenshotContainer = document.querySelector('.screenshot-container');

screenshotContainer?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

screenshotContainer?.addEventListener('touchend', (e) => {
    if (!touchStartX) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            // Swipe left - next
            currentScreen = currentScreen >= totalScreens ? 1 : currentScreen + 1;
        } else {
            // Swipe right - previous
            currentScreen = currentScreen <= 1 ? totalScreens : currentScreen - 1;
        }
        showScreenshot(currentScreen);
    }
    
    touchStartX = null;
});

// Console Easter Egg
console.log('%c💰 ImpulseLog', 'font-size: 24px; font-weight: bold; color: #8B5CF6;');
console.log('%cBuilding better spending habits, one impulse at a time.', 'font-size: 14px; color: #6B7280;');
console.log('%cInterested in joining our team? Email us at careers@impulselog.com', 'font-size: 12px; color: #10B981;');