// script.js
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// =============================================
// EMAILJS CONFIG — replace with your own keys
// =============================================
const EMAILJS_PUBLIC_KEY = '3w8PxqtDS-nfGKe-f'; // Make sure this is correct
const EMAILJS_SERVICE_ID = 'service_2irk05o'; // <--- Replace this!
const EMAILJS_TEMPLATE_ID = 'template_69lnina'; // <--- Replace this!

/**
 * EmailJS sending helper.
 */
async function sendEmailNotification(params) {
    if (typeof emailjs === 'undefined' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        console.warn("EmailJS not initialized or keys missing.");
        return false;
    }

    if (!params.from_email) {
        console.error("EmailJS Error: Recipient email (from_email) is missing in params.");
        return { success: false, message: "Email address is required." };
    }

    try {
        console.log("Sending email with params:", params);
        // Corrected v4 signature: publicKey is the 4th argument directly
        const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY);
        console.log('EmailJS Success:', response.status, response.text);
        return { success: true };
    } catch (err) {
        console.error('EmailJS Error Details:', err);
        // Return the actual error message to show in the UI
        // EmailJS errors often have a .text property for the message
        const errorMessage = err.text || err.message || "Unknown EmailJS error";
        console.error('EmailJS Error Message:', errorMessage);
        return { success: false, message: errorMessage };
    }
}

// 1. Initialize Lenis Smooth Scroll
let lenis;
function initLenis() {
    if (window.Lenis) {
        lenis = new Lenis({
            duration: 1.2,
            orientation: 'vertical',
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 1.5,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }
}

/**
 * 2. Portfolio Horizontal Scroll Animation
 */
function initPortfolioScroll() {
    const portfolioSection = document.querySelector(".portfolio-wrap");
    const portfolioContainer = document.querySelector(".portfolio-container");

    if (portfolioSection && portfolioContainer) {
        let mm = gsap.matchMedia();
        
        mm.add("(min-width: 0px)", () => {
            gsap.to(portfolioContainer, {
                x: () => -(portfolioContainer.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: portfolioSection,
                    pin: true,
                    scrub: 1,
                    end: () => "+=" + (portfolioContainer.scrollWidth - window.innerWidth),
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });
        });
    }
}

/**
 * 3. Hero Text Animation (Word-by-word reveal)
 */
function initHeroAnimation() {
    gsap.to(".logo img", {
        autoAlpha: 1,
        duration: 1.5,
        ease: "power2.out",
        delay: 0.2
    });

    const splitText = document.querySelector('.split-text');
    if (splitText) {
        const originalHTML = splitText.innerHTML;
        const lines = originalHTML.split(/<br\s*\/?>/i).map(l => l.trim()).filter(l => l !== "");
        
        splitText.innerHTML = ''; 
        lines.forEach(line => {
            const lineDiv = document.createElement('div');
            lineDiv.className = 'line-wrapper';
            lineDiv.style.cssText = 'overflow:hidden; display:block; padding: 0.05em 0; margin: -0.05em 0;';
            
            const words = line.split(/\s+/).filter(w => w !== "");
            words.forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'reveal-word';
                wordSpan.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom;';
                wordSpan.innerHTML = `<span class="inner-word" style="display:inline-block; will-change:transform;">${word}&nbsp;</span>`;
                lineDiv.appendChild(wordSpan);
            });
            splitText.appendChild(lineDiv);
        });

        const heroTl = gsap.timeline({ delay: 0.5 });

        heroTl.from(splitText.querySelectorAll(".inner-word"), {
            yPercent: 101,
            duration: 1,
            stagger: 0.03,
            ease: "expo.out",
            onComplete: () => ScrollTrigger.refresh()
        })
        .from(".hero .fade-up", {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power2.out",
            clearProps: "all"
        }, "-=0.8");
    }
}

/**
 * 3.1 Hero Slideshow Logic
 */
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    gsap.set(slides, { autoAlpha: 0 });
    gsap.set(slides[0], { autoAlpha: 1 });

    const nextSlide = () => {
        const nextIndex = (currentSlide + 1) % slides.length;
        const tl = gsap.timeline();
        tl.to(slides[currentSlide], { autoAlpha: 0, duration: 2, ease: "power2.inOut" })
          .to(slides[nextIndex], { autoAlpha: 1, duration: 2, ease: "power2.inOut" }, "<");
        currentSlide = nextIndex;
    };

    if (slides.length > 1) setInterval(nextSlide, 5000);
}

// 5. Scroll Progress Bar
gsap.to(".progress-bar", {
    width: "100%",
    ease: "none",
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        invalidateOnRefresh: true
    }
});

/**
 * 6. & 7. Scroll Animations
 */
function initScrollAnimations() {
    gsap.utils.toArray(".counter").forEach(counter => {
        const target = parseInt(counter.innerText);
        counter.innerText = "0";
        gsap.to(counter, {
            scrollTrigger: {
                trigger: counter,
                start: "top 90%",
            },
            innerText: target,
            duration: 2,
            snap: { innerText: 1 },
            ease: "power2.out"
        });
    });
}

/**
 * Global Notification Utility
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('notificationToast');
    const toastMsg = document.getElementById('notificationMessage');
    const toastIcon = document.getElementById('notificationIcon');
    const toastIconWrap = document.getElementById('notificationIconWrap');
    
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    
    if (type === 'success') {
        toastIconWrap.classList.remove('bg-orange-500');
        toastIconWrap.classList.add('bg-green-500');
        toastIcon.setAttribute('icon', 'ph:check-bold');
    } else {
        toastIconWrap.classList.remove('bg-green-500');
        toastIconWrap.classList.add('bg-orange-500');
        toastIcon.setAttribute('icon', 'ph:warning-bold');
    }

    gsap.to(toast, {
        y: -20,
        autoAlpha: 1,
        duration: 0.5,
        ease: "back.out(1.7)"
    });

    setTimeout(() => {
        gsap.to(toast, {
            y: 20,
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.in"
        });
    }, 5000);
}

/**
 * User Feedback Modal Logic — saves to Supabase `feedback` table
 * Columns: name (text), role (text), rating (int), message (text)
 */
function initFeedbackModal() {
    const modal = document.getElementById('feedbackModal');
    const openBtn = document.getElementById('openFeedbackModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const overlay = document.getElementById('closeModalOverlay');
    const form = document.getElementById('feedbackForm');
    const stars = document.querySelectorAll('#starRating span');
    let currentRating = 0;

    if (!modal || !openBtn) return;

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            currentRating = index + 1;
            updateStars(currentRating);
        });
        star.addEventListener('mouseenter', () => {
            updateStars(index + 1);
        });
    });

    document.getElementById('starRating').addEventListener('mouseleave', () => {
        updateStars(currentRating);
    });

    function updateStars(rating) {
        stars.forEach((s, i) => {
            s.style.opacity = i < rating ? "1" : "0.3";
        });
    }

    updateStars(0);

    const openModal = () => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        if (lenis) lenis.stop();
    };

    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        if (lenis) lenis.start();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (currentRating === 0) {
            showToast('Paki-pili po ng star rating (1-5 stars) bago mag-submit.', 'warning');
            return;
        }

        // Disable submit button to prevent double-submit
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        try {
            showToast('Salamat! Your feedback has been submitted. We appreciate your support.');
            closeModal();
            form.reset();
            currentRating = 0;
            updateStars(0);
        } catch (err) {
            console.error('Feedback submission error:', err);
            showToast(`Submission Error: ${err.message}`, 'warning');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

/**
 * Project Inquiry Modal Logic — saves to Supabase `project_inquiries` table
 * Columns: name (text), email (text), project_type (text), details (text)
 */
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const openBtns = document.querySelectorAll('#openProjectModal, .project-modal-trigger');
    const closeBtn = document.getElementById('closeProjectModalBtn');
    const overlay = document.getElementById('closeProjectModalOverlay');
    const form = document.getElementById('projectForm');

    if (!modal || openBtns.length === 0) return;

    const openModal = () => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        if (lenis) lenis.stop();
    };

    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        if (lenis) lenis.start();
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                // FormData picks up all fields that have a `name` attribute
                const data = Object.fromEntries(new FormData(form));

                // Map slugs to readable labels for the email
                const projectLabels = {
                    'website': 'Website Development',
                    'system': 'Custom Web System',
                    'ecommerce': 'E-Commerce',
                    'capstone': 'Capstone / Academic',
                    'other': 'Other'
                };

                const emailResult = await sendEmailNotification({
                    from_name: data.name,
                    from_email: data.email,
                    email: data.email, // Added to match your "to email" setting
                    phone_number: data.phone,
                    reply_to: data.email, // Added for easy replies
                    company_name: "Bay Dev Palawan",
                    project_type: projectLabels[data.project_type] || data.project_type,
                    details: data.details,
                    message: "" // Ensure key exists for template
                });

                if (emailResult.success) {
                    showToast('Salamat! Your project details have been sent. Check your email for response.');
                    closeModal();
                    form.reset();
                } else {
                    showToast(`Email error: ${emailResult.message}`, 'warning');
                }
            } catch (err) {
                console.error('Project inquiry submission error:', err);
                showToast(`Submission Error: ${err.message}`, 'warning');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
}

function initTechStackHover() {
    const techIcons = document.querySelectorAll('.tech-icon-item');
    const techTitle = document.getElementById('tech-title');
    const techDescription = document.getElementById('tech-description');
    const techGlow = document.getElementById('tech-glow');

    if (techTitle && techDescription) {
        gsap.set([techTitle, techDescription, techGlow].filter(Boolean), { autoAlpha: 0 });
        gsap.set([techTitle, techDescription], { y: 15 });
    }

    techIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            const color = icon.dataset.techColor || '#ffffff';
            const name = icon.dataset.techName;
            const description = icon.dataset.techDescription;

            if (techTitle && techDescription) {
                techTitle.textContent = name;
                techDescription.textContent = description;

                gsap.to([techTitle, techDescription], {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }

            if (techGlow) {
                gsap.to(techGlow, {
                    background: `radial-gradient(circle at 30% 50%, ${color}55, transparent 85%)`,
                    autoAlpha: 1,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
        });

        icon.addEventListener('mouseleave', () => {
            gsap.to([techTitle, techDescription, techGlow].filter(Boolean), {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.in"
            });
            gsap.to([techTitle, techDescription], { y: 15 });
        });
    });
}

/**
 * Initialize Particles.js background
 */
function initParticles() {
    if (window.particlesJS) {
        particlesJS('particles-js', {
            "particles": {
              "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
              "color": { "value": "#ffffff" },
              "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" } },
              "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } },
              "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } },
              "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.4, "width": 1 },
              "move": { "enable": true, "speed": 1, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
              "modes": { "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }
}

/**
 * Mobile Navigation Menu Logic
 */
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const openBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('closeMobileMenuBtn');
    const links = document.querySelectorAll('.mobile-link');

    if (!mobileMenu || !openBtn) return;

    const openMenu = () => {
        mobileMenu.classList.remove('translate-x-full');
        if (lenis) lenis.stop();
    };

    const closeMenu = () => {
        mobileMenu.classList.add('translate-x-full');
        if (lenis) lenis.start();
    };

    openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    
    links.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('href');
            closeMenu();
            setTimeout(() => {
                if (target.startsWith('#')) {
                    const el = document.querySelector(target);
                    if (el && lenis) lenis.scrollTo(el, { offset: -100 });
                }
            }, 400);
        });
    });
}

/**
 * Initialize Header scroll effect and smooth anchor links
 */
function initHeader() {
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 100;
                if (lenis) {
                    lenis.scrollTo(targetElement, { offset: -offset });
                } else {
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
                }
            }
        });
    });
}

/**
 * Contact Form Logic — saves to Supabase `contact_messages` table
 * Columns: name (text), email (text), project_type (text), message (text)
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            const data = Object.fromEntries(new FormData(form));

            // Map slugs to readable labels
            const projectLabels = {
                'website': 'Website Development',
                'system': 'Custom Web System',
                'ecommerce': 'E-Commerce',
                'capstone': 'Capstone / Academic',
                'other': 'Other'
            };

            const emailResult = await sendEmailNotification({
                from_name: data.name,
                from_email: data.email,
                email: data.email, // Added to match your "to email" setting
                phone_number: data.phone,
                reply_to: data.email, // Added for easy replies
                company_name: "Bay Dev Palawan",
                project_type: projectLabels[data.project_type] || data.project_type,
                details: data.details,
                message: "" // Ensure key exists for template fallback
            });

            if (emailResult.success) {
                showToast('Salamat! Your message has been sent. Check your email for response.');
                form.reset();
            } else {
                showToast(`Email error: ${emailResult.message}`, 'warning');
            }
        } catch (err) {
            console.error('Contact form submission error:', err);
            showToast(`Submission Error: ${err.message}`, 'warning');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

/**
 * Initialize Floating CTA logic
 */
function initFloatingCTA() {
    const cta = document.getElementById('floatingCTA');
    if (!cta) return;

    window.addEventListener('scroll', () => {
        // Lower threshold for mobile discovery
        const threshold = window.innerWidth < 768 ? 200 : 400;
        if (window.scrollY > threshold) {
            cta.classList.add('visible');
        } else {
            cta.classList.remove('visible');
        }
    });
}

// Event Listeners for Lifecycle
window.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        try {
            emailjs.init(EMAILJS_PUBLIC_KEY); // Correct v4 init syntax
        } catch (e) {
            console.error("EmailJS Init Error:", e);
        }
    } else {
        console.warn("EmailJS is not configured. Replace 'YOUR_PUBLIC_KEY' in script.js");
    }
    // initLenis(); // Removed for smoother native mobile experience
    initPortfolioScroll();
    initHeroAnimation();
    initHeroSlideshow();
    initFeedbackModal();
    initProjectModal();
    initMobileMenu();
    initTechStackHover();
    initParticles();
    initContactForm();
    initFloatingCTA();
    initHeader();
});

window.addEventListener('load', () => {
    initScrollAnimations();
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 1000);
});