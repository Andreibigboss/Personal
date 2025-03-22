// Smooth scrolling pentru link-urile de navigare cu efect de easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;
            
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutCubic(timeElapsed, startPosition, distance, 1200);
                window.scrollTo(0, run);
                if (timeElapsed < 1200) requestAnimationFrame(animation);
            }
            
            function easeInOutCubic(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }
            
            requestAnimationFrame(animation);
        }
    });
});

// Main IIFE pentru a evita poluarea scope-ului global
(function() {
    // Cache DOM elements și variabile pentru performanță
    const navbar = document.querySelector('.navbar');
    const hero = document.querySelector('.hero');
    const heroTitle = document.querySelector('.hero-content h1');
    const heroSubtitle = document.querySelector('.hero-content .subtitle');
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    const serviceCards = document.querySelectorAll('.service-card');

    // Variabile de stare
    let lastScrollPosition = 0;
    let ticking = false;
    let rafId = null;

    // Configurări
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const PARTICLE_POOL_SIZE = 30;

    // Funcții de utilitate
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Parallax effect optimizat cu lerp pentru smoothing
    let currentTranslation = 0;
    let targetTranslation = 0;

    function updateParallax() {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }

        targetTranslation = window.pageYOffset * 0.3;
        
        function animate() {
            currentTranslation = lerp(currentTranslation, targetTranslation, 0.1);
            
            if (Math.abs(targetTranslation - currentTranslation) > 0.01) {
                hero.style.transform = `translate3d(0, ${currentTranslation}px, 0)`;
                rafId = requestAnimationFrame(animate);
            } else {
                hero.style.transform = `translate3d(0, ${targetTranslation}px, 0)`;
            }
        }
        
        rafId = requestAnimationFrame(animate);
    }

    // Event handlers
    const handleScroll = throttle(() => {
        const currentScroll = window.pageYOffset;
        
        if (Math.abs(currentScroll - lastScrollPosition) > 5) {
            if (currentScroll > lastScrollPosition && currentScroll > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
                navbar.style.background = 'var(--nav-bg)';
            }
            
            if (currentScroll > 50) {
                if (!navbar.classList.contains('scrolled')) {
                    navbar.classList.add('scrolled');
                }
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScrollPosition = currentScroll;
        }

        updateParallax();
    }, 16);

    // Event listeners
    window.addEventListener('scroll', handleScroll);

    // Smooth scrolling optimizat
    function smoothScroll(target, duration = 1200) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        let animationFrameId = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                animationFrameId = requestAnimationFrame(animation);
            }
        }
        
        function easeInOutCubic(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t * t + b;
            t -= 2;
            return c / 2 * (t * t * t + 2) + b;
        }
        
        // Anulăm orice animație existentă
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        
        animationFrameId = requestAnimationFrame(animation);
        rafId = animationFrameId;
    }

    // Event listeners pentru smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScroll(target);
            }
        });
    });

    // Animație pentru cardurile de servicii cu stagger effect
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px) scale(0.95)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
    });

    // Efect de hover pentru butoane cu gradient dinamic și magnetic effect
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Magnetic effect
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const offsetX = ((mouseX - centerX) / centerX) * 10;
            const offsetY = ((mouseY - centerY) / centerY) * 10;
            
            button.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.05)`;
            
            if (button.classList.contains('primary')) {
                button.style.background = `radial-gradient(circle at ${x}% ${y}%, var(--accent-secondary), var(--accent-primary))`;
            } else {
                button.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(138, 43, 226, 0.2), transparent)`;
            }
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0) scale(1)';
            if (button.classList.contains('primary')) {
                button.style.background = 'var(--button-gradient)';
            } else {
                button.style.background = 'transparent';
            }
        });
    });

    // Animație pentru text în hero section cu stagger effect
    window.addEventListener('load', () => {
        const elements = [heroTitle, heroSubtitle, ...heroButtons];
        
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 500 + index * 200);
        });
    });

    // Sistem de particule
    const particleSystem = (function() {
        const particlePool = [];

        // Inițializare pool de particule
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.position = 'fixed';
            particle.style.pointerEvents = 'none';
            particle.style.borderRadius = '50%';
            particle.style.display = 'none';
            document.body.appendChild(particle);
            particlePool.push({
                element: particle,
                active: false
            });
        }

        function getParticle() {
            return particlePool.find(particle => !particle.active) || null;
        }

        function createParticle(x, y) {
            const particle = getParticle();
            if (!particle) return;

            particle.active = true;
            const element = particle.element;
            element.style.display = 'block';
            
            const size = Math.random() * 4 + 2;
            const rotation = Math.random() * 360;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 2 + 1;
            const lifetime = Math.random() * 0.5 + 0.5;
            let life = 0;
            
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.background = `rgba(138, 43, 226, ${Math.random() * 0.5 + 0.3})`;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.transform = `rotate(${rotation}deg)`;
            
            function update() {
                life += 0.016;
                if (life >= lifetime) {
                    element.style.display = 'none';
                    particle.active = false;
                    return;
                }
                
                const progress = life / lifetime;
                const currentX = parseFloat(element.style.left);
                const currentY = parseFloat(element.style.top);
                const scale = 1 - progress;
                
                element.style.left = `${currentX + Math.cos(angle) * velocity}px`;
                element.style.top = `${currentY + Math.sin(angle) * velocity}px`;
                element.style.opacity = 1 - progress;
                element.style.transform = `rotate(${rotation}deg) scale(${scale})`;
                
                requestAnimationFrame(update);
            }
            
            requestAnimationFrame(update);
        }

        return { createParticle };
    })();

    // Event handlers
    const createThrottledParticle = throttle((e) => {
        const numParticles = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numParticles; i++) {
            particleSystem.createParticle(
                e.clientX + (Math.random() * 20 - 10),
                e.clientY + (Math.random() * 20 - 10)
            );
        }
    }, 32);

    const handleButtonHover = throttle((e, button) => {
        const rect = button.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const offsetX = ((mouseX - centerX) / centerX) * 8;
        const offsetY = ((mouseY - centerY) / centerY) * 8;
        
        requestAnimationFrame(() => {
            button.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.05)`;
            if (button.classList.contains('primary')) {
                button.style.background = `radial-gradient(circle at ${x}% ${y}%, var(--accent-secondary), var(--accent-primary))`;
            }
        });
    }, 16);

    // Event listeners
    window.addEventListener('mousemove', createThrottledParticle);

    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mousemove', (e) => handleButtonHover(e, button));
        button.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                button.style.transform = 'translate(0, 0) scale(1)';
                if (button.classList.contains('primary')) {
                    button.style.background = 'var(--button-gradient)';
                }
            });
        });
    });

    // Observere și animații
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                    }, index * 50);
                });
                cardObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        card.style.transition = `all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        cardObserver.observe(card);
    });

    // Stiluri pentru particule
    const style = document.createElement('style');
    style.textContent = `
    .particle {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        will-change: transform, opacity;
    }
    `;
    document.head.appendChild(style);

    // Animații la încărcare
    window.addEventListener('load', () => {
        [heroTitle, heroSubtitle, ...heroButtons].forEach((el, index) => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    }, 300 + index * 100);
                });
            }
        });
    });

    // Funcționalitate pentru formularul de contact
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Dezactivăm butonul și arătăm loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se trimite...';
        
        // Pregătim datele pentru trimitere
        const templateParams = {
            from_name: this.user_name.value,
            from_email: this.user_email.value,
            message: this.message.value
        };
        
        // Trimitem emailul
        emailjs.send('service_mvr9l4f', 'template_n76j09k', templateParams)
            .then(function() {
                // Succes
                submitButton.innerHTML = '<i class="fas fa-check"></i> Trimis!';
                submitButton.classList.add('success');
                e.target.reset();
                
                // Resetăm butonul după 3 secunde
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    submitButton.classList.remove('success');
                }, 3000);
            }, function(error) {
                // Eroare
                console.error('Eroare la trimiterea emailului:', error);
                submitButton.innerHTML = '<i class="fas fa-exclamation-circle"></i> Eroare';
                submitButton.style.background = '#ef4444';
                
                // Resetăm butonul după 3 secunde
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                    submitButton.style.background = '';
                }, 3000);
            });
    });
})(); 