const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function setMobileMenuState(isOpen) {
    if (!mobileMenuToggle || !mobileMenu) return;

    mobileMenu.classList.toggle('active', isOpen);
    mobileMenuToggle.classList.toggle('active', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
}

if (mobileMenuToggle && mobileMenu) {
    if (!mobileMenu.id) mobileMenu.id = 'mobile-navigation';
    mobileMenuToggle.setAttribute('aria-controls', mobileMenu.id);
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuToggle.addEventListener('click', () => {
        setMobileMenuState(!mobileMenu.classList.contains('active'));
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = 72;
        const sectionTop = section.offsetTop - navHeight;
        window.scrollTo({
            top: sectionTop,
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
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

const APP_STORE_BASE_URL = 'https://apps.apple.com/us/app/impulse-log/id6747727094';
const APP_STORE_PROVIDER_TOKEN = '';

function sanitizeCampaignToken(value) {
    return String(value || 'website')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40) || 'website';
}

function getPageCampaign() {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    return sanitizeCampaignToken(path || 'homepage');
}

function buildCampaignToken(ctaLocation) {
    const pagePart = getPageCampaign().slice(0, 22);
    const ctaPart = sanitizeCampaignToken(ctaLocation).slice(0, 17);
    return sanitizeCampaignToken(`${pagePart}_${ctaPart}`);
}

function buildTrackedAppStoreUrl(campaign) {
    const url = new URL(APP_STORE_BASE_URL);
    url.searchParams.set('ct', sanitizeCampaignToken(campaign));
    url.searchParams.set('mt', '8');

    if (APP_STORE_PROVIDER_TOKEN) {
        url.searchParams.set('pt', APP_STORE_PROVIDER_TOKEN);
    }

    return url.toString();
}

function describeCtaLocation(link, index) {
    if (link.dataset.appCta) {
        return link.dataset.appCta;
    }

    const section = link.closest('section[id], section[class], nav, footer, .mobile-menu, .floating-cta, .sidebar');
    const sectionName = section?.id || section?.className || section?.tagName || 'page';
    const linkText = link.textContent.trim() || 'app_store';
    return `${sectionName}_${linkText}_${index + 1}`;
}

function instrumentAppStoreLinks() {
    const appStoreLinks = document.querySelectorAll(`a[href*="${APP_STORE_BASE_URL}"]`);

    appStoreLinks.forEach((link, index) => {
        const ctaLocation = describeCtaLocation(link, index);
        const campaign = buildCampaignToken(ctaLocation);
        link.href = buildTrackedAppStoreUrl(campaign);
        link.dataset.appStoreCampaign = campaign;

        link.addEventListener('click', () => {
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'app_store_click', {
                    event_category: 'conversion',
                    event_label: campaign,
                    page_path: window.location.pathname,
                    link_text: link.textContent.trim(),
                    cta_location: ctaLocation,
                    transport_type: 'beacon'
                });
            }
        });
    });
}

instrumentAppStoreLinks();

// Floating CTA on Scroll
const floatingCta = document.getElementById('floating-cta');

if (floatingCta) {
    let scrollUpdateQueued = false;

    window.addEventListener('scroll', () => {
        if (scrollUpdateQueued) return;
        scrollUpdateQueued = true;

        window.requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            floatingCta.classList.toggle('visible', scrollTop > 600);
            scrollUpdateQueued = false;
        });
    }, { passive: true });
}

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

// Listen for calculator input changes
impulsesPerWeek?.addEventListener('input', calculateSavings);
averageAmount?.addEventListener('input', calculateSavings);

// Initialize calculator
calculateSavings();


// Generate QR Code
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
        const appStoreUrl = buildTrackedAppStoreUrl(`${getPageCampaign()}_qr_code`);
        
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

if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
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
const screenshotCarousel = document.querySelector('.screenshots-carousel');
const carouselPlayback = document.querySelector('.carousel-playback');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const CAROUSEL_AUTOPLAY_DELAY = 5000;

function showScreenshot(screenNumber) {
    screenshotDots.forEach(dot => {
        const isActive = dot.dataset.screen === String(screenNumber);
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-pressed', String(isActive));
    });

    screenshotWrappers.forEach(wrapper => {
        const isActive = wrapper.dataset.screen === String(screenNumber);
        wrapper.classList.toggle('active', isActive);
        wrapper.setAttribute('aria-hidden', String(!isActive));
        wrapper.toggleAttribute('inert', !isActive);
    });
}

if (screenshotWrappers.length > 0) {
    let currentScreen = 1;
    const totalScreens = screenshotWrappers.length;
    let autoplayTimer = null;
    let isCarouselVisible = !('IntersectionObserver' in window);
    let isPointerPaused = false;
    let isFocusPaused = false;
    let isPausedByUser = false;

    const clearAutoplay = () => {
        if (autoplayTimer !== null) {
            window.clearTimeout(autoplayTimer);
            autoplayTimer = null;
        }
    };

    const canAutoplay = () => (
        !reducedMotionQuery.matches
        && !document.hidden
        && isCarouselVisible
        && !isPointerPaused
        && !isFocusPaused
        && !isPausedByUser
    );

    const scheduleAutoplay = () => {
        clearAutoplay();
        if (!canAutoplay()) return;

        autoplayTimer = window.setTimeout(() => {
            currentScreen = currentScreen >= totalScreens ? 1 : currentScreen + 1;
            showScreenshot(currentScreen);
            scheduleAutoplay();
        }, CAROUSEL_AUTOPLAY_DELAY);
    };

    const updatePlaybackControl = () => {
        if (!carouselPlayback) return;

        carouselPlayback.hidden = reducedMotionQuery.matches;
        carouselPlayback.setAttribute(
            'aria-label',
            isPausedByUser ? 'Resume automatic screenshot rotation' : 'Pause automatic screenshot rotation'
        );

        const label = carouselPlayback.querySelector('.carousel-playback-label');
        const icon = carouselPlayback.querySelector('.carousel-playback-icon');
        if (label) label.textContent = isPausedByUser ? 'Play' : 'Pause';
        if (icon) icon.textContent = isPausedByUser ? '▶' : 'Ⅱ';
    };

    screenshotDots.forEach(dot => {
        dot.addEventListener('click', () => {
            currentScreen = Number(dot.dataset.screen);
            showScreenshot(currentScreen);
            scheduleAutoplay();
        });
    });

    let touchStartX = null;
    const screenshotContainer = document.querySelector('.screenshot-container');

    screenshotContainer?.addEventListener('touchstart', (event) => {
        clearAutoplay();
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    screenshotContainer?.addEventListener('touchend', (event) => {
        if (touchStartX === null) return;

        const diff = touchStartX - event.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            currentScreen = diff > 0
                ? (currentScreen >= totalScreens ? 1 : currentScreen + 1)
                : (currentScreen <= 1 ? totalScreens : currentScreen - 1);
            showScreenshot(currentScreen);
        }

        touchStartX = null;
        scheduleAutoplay();
    }, { passive: true });

    screenshotCarousel?.addEventListener('mouseenter', () => {
        isPointerPaused = true;
        clearAutoplay();
    });

    screenshotCarousel?.addEventListener('mouseleave', () => {
        isPointerPaused = false;
        scheduleAutoplay();
    });

    screenshotCarousel?.addEventListener('focusin', (event) => {
        if (event.target === carouselPlayback && !isPausedByUser) return;
        isFocusPaused = true;
        clearAutoplay();
    });

    screenshotCarousel?.addEventListener('focusout', () => {
        window.setTimeout(() => {
            const focusedElement = document.activeElement;
            isFocusPaused = Boolean(
                screenshotCarousel.contains(focusedElement)
                && focusedElement !== carouselPlayback
            );
            scheduleAutoplay();
        }, 0);
    });

    carouselPlayback?.addEventListener('click', () => {
        isPausedByUser = !isPausedByUser;
        isFocusPaused = false;
        updatePlaybackControl();
        scheduleAutoplay();
    });

    document.addEventListener('visibilitychange', scheduleAutoplay);

    const handleReducedMotionChange = () => {
        updatePlaybackControl();
        scheduleAutoplay();
    };

    if (typeof reducedMotionQuery.addEventListener === 'function') {
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    } else {
        reducedMotionQuery.addListener(handleReducedMotionChange);
    }

    if ('IntersectionObserver' in window && screenshotCarousel) {
        const carouselObserver = new IntersectionObserver(([entry]) => {
            isCarouselVisible = entry.isIntersecting;
            scheduleAutoplay();
        }, { threshold: 0.2 });

        carouselObserver.observe(screenshotCarousel);
    }

    showScreenshot(currentScreen);
    updatePlaybackControl();
    scheduleAutoplay();
}
