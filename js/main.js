// Initialize AOS (Animate on Scroll) safely - load if not present
function initAOS() {
    if (window.AOS && typeof AOS.init === 'function') {
        AOS.init({ duration: 1000, once: true, offset: 100 });
    } else {
        // try to load AOS dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        script.onload = () => {
            if (window.AOS && typeof AOS.init === 'function') {
                AOS.init({ duration: 1000, once: true, offset: 100 });
            }
        };
        script.onerror = () => console.warn('AOS failed to load');
        document.head.appendChild(script);
    }
}

// Call on DOMContentLoaded to ensure DOM exists
document.addEventListener('DOMContentLoaded', initAOS);

// Create animated circuit dots
function createCircuitDots() {
    const hero = document.querySelector('.hero');
    if (!hero) return; // guard: hero might not exist on some pages
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'circuit-dots';
    
    // Create 30 dots with random positions
    for (let i = 0; i < 30; i++) {
        const dot = document.createElement('div');
        dot.className = 'circuit-dot';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        dot.style.left = `${x}%`;
        dot.style.top = `${y}%`;
        
        // Random animation delay
        dot.style.animationDelay = `${Math.random() * 2}s`;
        
        dotsContainer.appendChild(dot);
    }
    
    hero.appendChild(dotsContainer);
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', createCircuitDots);

// Navigation menu toggle
// Navigation menu toggle (guard for missing elements)
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Initialize EmailJS only if contact form exists; attempt dynamic load if emailjs missing
(function initEmailJsIfNeeded(){
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    // If emailjs already available, init
    if (window.emailjs && typeof window.emailjs.init === 'function'){
        try{ emailjs.init("YOUR_PUBLIC_KEY"); }catch(e){console.warn('EmailJS init failed',e);}    
        return;
    }
    // Otherwise dynamically load EmailJS script and init when ready
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'; s.onload = ()=>{
        try{ if(window.emailjs && typeof window.emailjs.init==='function'){ emailjs.init("YOUR_PUBLIC_KEY"); } }catch(e){ console.warn('EmailJS dynamic init failed', e); }
    };
    s.onerror = ()=> console.warn('Failed to load EmailJS script');
    document.head.appendChild(s);
})();

// Form submission handler
async function handleSubmit(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('.submit-button');
    const formMessage = document.querySelector('.form-message') || document.createElement('div');
    formMessage.className = 'form-message';
    form.parentNode.appendChild(formMessage);

    // Show loading state
    submitButton.classList.add('loading');
    form.classList.remove('success', 'error');

    try {
        const templateParams = {
            to_email: 'blagoje994@gmail.com',
            from_name: document.getElementById('name').value,
            from_email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        if (!window.emailjs || typeof window.emailjs.send !== 'function'){
            throw new Error('EmailJS not available');
        }
        await emailjs.send(
            'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
            'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
            templateParams
        );

        // Success state
        form.reset();
        form.classList.add('success');
        formMessage.textContent = 'Hvala na poruci! Kontaktiraćemo vas uskoro.';
        formMessage.className = 'form-message success';
    } catch (error) {
        // Error state
        console.error('Error:', error);
        form.classList.add('error');
        if(error && error.message && error.message.indexOf('EmailJS')>=0){
            formMessage.textContent = 'Email servis nije dostupan trenutno. Možete ostaviti poruku, ili pokušajte kasnije.';
        } else {
            formMessage.textContent = 'Došlo je do greške. Molimo pokušajte ponovo.';
        }
        formMessage.className = 'form-message error';
    } finally {
        // Remove loading state
        submitButton.classList.remove('loading');
    }

    return false;
}