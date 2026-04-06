'use strict';

gsap.registerPlugin(ScrollTrigger);

// === 1. LOADER — opacity+transform apenas, sem filter, duração reduzida ===
const loaderAnim = gsap.timeline({
    onComplete: () => {
        gsap.to('#loader', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                const loaderEl = document.getElementById('loader');
                if (loaderEl) loaderEl.style.display = 'none';
                document.body.classList.add('ready');
                initMainAnimations();
                if (window.matchMedia('(min-width: 1024px) and (any-pointer: fine)').matches) {
                    gsap.to('.custom-cursor', { opacity: 1, duration: 0.5 });
                    initCursor();
                }
            }
        });
    }
});

loaderAnim
    .to('#loader-logo', { opacity: 1, scale: 1.05, duration: 0.8, ease: 'power2.out' })
    .to('#loader-logo', { scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.2');

// === 2. SCROLL ANIMATIONS — ScrollTrigger.batch (menos triggers, menos TBT) ===
function initMainAnimations() {
    gsap.fromTo('#home .reveal',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: '#home', start: 'top 85%', toggleActions: 'play none none none' } }
    );

    ScrollTrigger.batch('.reveal', {
        interval: 0.1,
        batchMax: 5,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: 'power2.out', overwrite: true }),
        start: 'top 90%'
    });

    ScrollTrigger.batch('.reveal-card', {
        interval: 0.1,
        batchMax: 5,
        onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 1, ease: 'power2.out', overwrite: true }),
        start: 'top 90%'
    });

    // === 3. MAGNETIC BUTTONS — quickTo para limitar updates por frame ===
    if (window.matchMedia('(min-width: 1024px)').matches) {
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            const quickX = gsap.quickTo(btn, 'x', { duration: 0.3, ease: 'power2.out' });
            const quickY = gsap.quickTo(btn, 'y', { duration: 0.3, ease: 'power2.out' });
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                quickX((e.clientX - rect.left - rect.width / 2) * 0.45);
                quickY((e.clientY - rect.top - rect.height / 2) * 0.45);
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            });
        });

        // Rotação reduzida de 10 → 5 graus
        document.querySelectorAll('.plan-card').forEach(card => {
            const quickRX = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
            const quickRY = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                quickRX(((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5);
                quickRY(((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5);
                gsap.to(card, { scale: 1.02, transformPerspective: 1000, duration: 0.4, ease: 'power2.out' });
            });
            card.addEventListener('mouseleave', () => {
                quickRX(0);
                quickRY(0);
                gsap.to(card, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }
}

// === MOBILE MENU ===
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const b1 = document.getElementById('bar1');
const b2 = document.getElementById('bar2');
const b3 = document.getElementById('bar3');
let isOpen = false;

function toggleMenu() {
    isOpen = !isOpen;
    if (isOpen) {
        mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
        mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
        b1.style.transform = 'rotate(45deg) translate(5px,5px)';
        b2.style.opacity = '0';
        b3.style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
        mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
        b1.style.transform = b3.style.transform = '';
        b2.style.opacity = '1';
    }
}
if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', toggleMenu));

// === 5. FAQ — apenas toggle de classe, max-height via CSS ===
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('button').addEventListener('click', () => {
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
    });
});

// === 4. FLOATING NAV — offsets calculados uma única vez no init ===
const nav = document.getElementById('floating-nav');
const sections = Array.from(document.querySelectorAll('section[id]'));
const navItems = document.querySelectorAll('.nav-item');
const sectionOffsets = sections.map(s => s.offsetTop - s.clientHeight / 3);
let rafScheduled = false;

function handleScrollNav() {
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
        rafScheduled = false;
        const scrollY = window.scrollY;

        if (scrollY > 200) {
            nav.classList.remove('opacity-0', '-translate-y-10', 'pointer-events-none');
            nav.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            nav.classList.add('opacity-0', '-translate-y-10', 'pointer-events-none');
            nav.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }

        let current = '';
        for (let i = 0; i < sectionOffsets.length; i++) {
            if (scrollY >= sectionOffsets[i]) current = sections[i].id;
        }
        navItems.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    });
}

window.addEventListener('scroll', handleScrollNav, { passive: true });

// === PLAN CARD SCROLL INDICATOR ===
const planContainer = document.querySelector('.cards-container');
const planIndicator = document.getElementById('plan-scroll-indicator');
if (planContainer && planIndicator) {
    planContainer.addEventListener('scroll', () => {
        const pct = (planContainer.scrollLeft / (planContainer.scrollWidth - planContainer.clientWidth)) * 100;
        gsap.to(planIndicator, { x: (pct * 2) + '%', duration: 0.2, ease: 'power2.out' });
    }, { passive: true });
}

// === 6. CUSTOM CURSOR — apenas desktop, quickTo com duration 0.25 ===
function initCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3' });
    window.addEventListener('mousemove', e => {
        xTo(e.clientX);
        yTo(e.clientY);
    }, { passive: true });
    document.querySelectorAll('a, button, [role="button"], .btn-magnetic').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}
