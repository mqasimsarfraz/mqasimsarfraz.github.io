/* ============================================
   Qasim Sarfraz — Portfolio Main JS
   ============================================ */

(function () {
    'use strict';

    // --- Hero Typing Animation ---
    const heroTyped = document.getElementById('hero-typed');
    const heroCursor = document.getElementById('hero-cursor');
    const heroOutput = document.getElementById('hero-output');

    if (heroTyped && heroOutput) {
        const command = 'cat about.md';
        const outputText = `{
  "name": "Qasim Sarfraz",
  "role": "Software Engineer @ Microsoft",
  "focus": ["eBPF", "Containers", "Kubernetes", "OSS"],
  "projects": ["inspektor-gadget", "aks-mcp", "coredns"],
  "location": "Hamburg, Germany"
}`;

        let charIndex = 0;

        function typeCommand() {
            if (charIndex < command.length) {
                heroTyped.textContent += command[charIndex];
                charIndex++;
                setTimeout(typeCommand, 60 + Math.random() * 40);
            } else {
                setTimeout(showOutput, 300);
            }
        }

        function showOutput() {
            heroOutput.textContent = outputText;
            heroOutput.classList.add('visible');
        }

        setTimeout(typeCommand, 800);
    }

    // --- Navigation Scroll Effect ---
    const nav = document.getElementById('nav');
    if (nav) {
        let lastScroll = 0;
        window.addEventListener('scroll', function () {
            const currentScroll = window.scrollY;
            if (currentScroll > 50) {
                nav.classList.add('nav--scrolled');
            } else {
                nav.classList.remove('nav--scrolled');
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        navMenu.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // --- Intersection Observer for Reveal Animations ---
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length > 0) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    }

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Active Nav Link Highlight ---
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length > 0 && navLinks.length > 0) {
        const sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -50% 0px'
        });

        sections.forEach(function (section) {
            sectionObserver.observe(section);
        });
    }
})();
