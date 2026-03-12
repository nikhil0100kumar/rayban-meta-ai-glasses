/* ═══════════════════════════════════════
   META RAY-BAN — ENGINE (MASTERPIECE EDITION)
   Premium Scroll, GSAP Choreography, Canvas Video
   ═══════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// ─── 1. LENIS SMOOTH SCROLL ───
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ─── 2. FRAME PRELOADER ───
const FRAME_COUNT = 201;
const frames = [];
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPercent = document.getElementById('loader-percent');

function padNum(n) {
    return String(n).padStart(4, '0');
}

// Canvas sizing with devicePixelRatio
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', () => {
    resizeCanvas();
    if (frames[currentFrame]) drawFrame(currentFrame);
});

// Frame renderer — padded cover mode
const IMAGE_SCALE = 1.0;

function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete) return;

    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    // Draw dark background under image to match theme
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    // Add subtle vignette/dim to edges for premium feel
    const gradient = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) / 1.5);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cw, ch);
}

// Two-phase loading: first 15 fast, then rest
let loadedCount = 0;
let currentFrame = 0;

function loadFrame(index) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            frames[index] = img;
            loadedCount++;
            const pct = Math.round((loadedCount / FRAME_COUNT) * 100);
            if (loaderBar) loaderBar.style.width = pct + '%';
            if (loaderPercent) loaderPercent.textContent = pct + '%';
            resolve();
        };
        img.onerror = () => {
            loadedCount++;
            resolve();
        };
        img.src = `frames/frame_${padNum(index + 1)}.webp`;
    });
}

async function preloadFrames() {
    resizeCanvas();

    // Phase 1: Load first 15 frames for fast first paint
    const firstPhase = [];
    for (let i = 0; i < Math.min(15, FRAME_COUNT); i++) {
        firstPhase.push(loadFrame(i));
    }
    await Promise.all(firstPhase);

    // Draw first frame immediately safely via raf
    requestAnimationFrame(() => {
        if (frames[0]) drawFrame(0);
    });

    // Phase 2: Load remaining frames in batches
    for (let i = 15; i < FRAME_COUNT; i += 15) {
        const batch = [];
        for (let j = i; j < Math.min(i + 15, FRAME_COUNT); j++) {
            batch.push(loadFrame(j));
        }
        // Dont block initialization, let them load in background
        Promise.all(batch);
    }

    // Give a tiny buffer for UI to settle
    setTimeout(initExperience, 500);
}

// ─── 3. EXPERIENCE INIT CHOREOGRAPHY ───
function initExperience() {
    // Hide loader with a nice fade out
    if (loader) {
        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => loader.style.display = 'none'
        });
    }

    // Master Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    gsap.set('.heading-line', { overflow: 'hidden' });

    // We wrap contents to animate them from bottom
    document.querySelectorAll('.heading-line').forEach(el => {
        const inner = el.innerHTML;
        el.innerHTML = `<span class="split-inner" style="display:inline-block;">${inner}</span>`;
    });

    // Animate Header
    gsap.set('.site-header', { xPercent: -50, yPercent: -150 });
    tl.to('.site-header', {
        yPercent: 0,
        duration: 1.2,
    }, 0.2);

    // Immersive Hero Images Entrance
    tl.to('#hero-media-1', {
        opacity: 0.6,
        scale: 1.0,
        duration: 3,
        ease: "power2.out"
    }, 0)
        .to('#hero-media-2', {
            opacity: 0.5,
            scale: 1.05,
            duration: 4,
            ease: "power2.out"
        }, 1.0);

    // Animate Hero Elements
    tl.from('.hero-label', {
        y: 30, opacity: 0, duration: 1
    }, 0.4)
        .fromTo('.split-inner',
            { y: 150, rotation: 5, transformOrigin: 'left top' },
            { y: 0, rotation: 0, duration: 1.4, stagger: 0.15 },
            0.5
        )
        .from('.hero-tagline', {
            y: 40, opacity: 0, duration: 1
        }, 0.8)
        .from('.btn-primary, .btn-secondary', {
            y: 30, opacity: 0, duration: 1, stagger: 0.15
        }, 1.0)
        .from('.scroll-indicator', {
            opacity: 0, duration: 1
        }, 1.5);

    setupScrollEngine();
}

// ─── 4. SCROLL ENGINE ───
const scrollContainer = document.getElementById('scroll-container');
const canvasWrap = document.getElementById('canvas-wrap');
const heroSection = document.querySelector('.hero-standalone');
const FRAME_SPEED = 1.3;

function setupScrollEngine() {
    // 4a. Frame-to-scroll binding
    ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        onUpdate: (self) => {
            const rawProgress = self.progress * FRAME_SPEED;
            const index = Math.min(Math.floor(rawProgress * FRAME_COUNT), FRAME_COUNT - 1);
            if (index !== currentFrame && frames[index] && frames[index].complete) {
                currentFrame = index;
                drawFrame(currentFrame);
            }
        }
    });

    // 4b. Cinematic Reveal of Canvas (Circle Wipe + Fade)
    ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: '10% top',
        scrub: true,
        onUpdate: (self) => {
            const p = self.progress;

            // Fade out the hero UI and create deep parallax
            if (heroSection) {
                heroSection.style.opacity = Math.max(0, 1 - p * 2.5);

                // Disable full section transform because we parallax elements individually
                heroSection.style.transform = 'none';

                const hc = heroSection.querySelector('.hero-content');
                if (hc) hc.style.transform = `translateY(${-p * 300}px)`;

                const hmc = heroSection.querySelector('.hero-media-container');
                if (hmc) hmc.style.transform = `translateY(${-p * 150}px)`;

                const hm1 = document.getElementById('hero-media-1');
                const hm2 = document.getElementById('hero-media-2');
                if (hm1) hm1.style.transform = `scale(${1 + p * 0.1})`;
                if (hm2) hm2.style.transform = `scale(${1.05 + p * 0.15})`;
            }

            // Reveal canvas in a circular sweep
            const wipeProgress = Math.min(1, p * 1.5);
            const radius = wipeProgress * 150;
            if (canvasWrap) canvasWrap.style.clipPath = `circle(${radius}% at 50% 50%)`;
        }
    });

    // 4c. Section Animations
    document.querySelectorAll('.scroll-section').forEach((section, index) => {
        positionSection(section, index);
        setupSectionAnimation(section);
    });

    initCounters();
    initMarquee();
    initDarkOverlay(0.65, 0.85);
}

function positionSection(section, index) {
    if (section.id === 'final-cta') {
        section.style.top = 'calc(100% - 50vh)';
        section.style.transform = 'translateY(-50%)';
        return;
    }
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;
    const midpoint = (enter + leave) / 2;
    const containerHeight = parseInt(getComputedStyle(scrollContainer).height);
    const top = midpoint * containerHeight;
    section.style.top = top + 'px';
    section.style.transform = 'translateY(-50%)';

    if (window.innerWidth <= 1024) {
        section.classList.remove('align-right');
        section.classList.remove('align-left');
    }
}

function setupSectionAnimation(section) {
    const type = section.dataset.animation;
    const persist = section.dataset.persist === 'true';
    const enter = parseFloat(section.dataset.enter) / 100;
    const leave = parseFloat(section.dataset.leave) / 100;

    const contentBox = section.querySelector('.section-inner') || section.querySelector('.cta-inner');
    const children = section.querySelectorAll('.section-label, .section-heading, .section-body, .stat, .cta-button, .cta-buttons-wrap');

    if (contentBox) gsap.set(contentBox, { opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    if (contentBox) tl.to(contentBox, { opacity: 1, duration: 0.2 });

    switch (type) {
        case 'fade-up':
        default:
            tl.from(children, { y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.1");
            break;
        case 'slide-left':
            tl.from(children, { x: -60, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.1");
            break;
        case 'slide-right':
            tl.from(children, { x: 60, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }, "-=0.1");
            break;
        case 'scale-up':
            tl.from(children, { scale: 0.9, y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'back.out(1.7)' }, "-=0.1");
            break;
    }

    let isVisible = false;

    ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            const p = self.progress;
            const inRange = p >= enter && p <= leave;
            const pastRange = p > leave;

            if (inRange && !isVisible) {
                section.classList.add('visible');
                tl.play();
                isVisible = true;
            } else if (!inRange && isVisible) {
                if (persist && pastRange) {
                    // Keep visible usually for final stats/cta
                } else {
                    section.classList.remove('visible');
                    tl.reverse();
                    isVisible = false;
                }
            }
        }
    });
}

function initCounters() {
    document.querySelectorAll('.stat-number').forEach(el => {
        const target = parseFloat(el.dataset.value);
        let counted = false;

        ScrollTrigger.create({
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                if (self.progress >= 0.65 && !counted) {
                    counted = true;
                    // Provide a subtle counting animation
                    gsap.to(el, {
                        innerHTML: target,
                        duration: 2.5,
                        ease: 'power3.out',
                        snap: { innerHTML: 1 },
                        onUpdate: function () {
                            el.innerHTML = Math.round(this.targets()[0].innerHTML);
                        }
                    });
                }
            }
        });
    });
}

function initMarquee() {
    const marqueeWrap = document.querySelector('.marquee-wrap');
    const marqueeText = document.querySelector('.marquee-text');
    if (!marqueeWrap || !marqueeText) return;

    const speed = parseFloat(marqueeWrap.dataset.scrollSpeed) || -40;
    gsap.to(marqueeText, {
        xPercent: speed,
        ease: 'none',
        scrollTrigger: {
            trigger: scrollContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true
        }
    });

    ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
            const p = self.progress;
            let opacity = 0;
            if (p > 0.15 && p < 0.60) {
                opacity = 1;
            } else if (p >= 0.10 && p <= 0.15) {
                opacity = (p - 0.10) / 0.05;
            } else if (p >= 0.60 && p <= 0.65) {
                opacity = 1 - (p - 0.60) / 0.05;
            }
            marqueeWrap.style.opacity = opacity;
        }
    });
}

function initDarkOverlay(enter, leave) {
    const overlay = document.getElementById('dark-overlay');
    if (!overlay) return;

    const fadeRange = 0.05;
    ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
            const p = self.progress;
            let opacity = 0;
            if (p >= enter - fadeRange && p <= enter) {
                opacity = (p - (enter - fadeRange)) / fadeRange;
            } else if (p > enter && p < leave) {
                opacity = 0.85;
            } else if (p >= leave && p <= leave + fadeRange) {
                opacity = 0.85 * (1 - (p - leave) / fadeRange);
            }
            overlay.style.opacity = opacity;
        }
    });
}

preloadFrames();
