// --- CANVAS PARTICLE SYSTEM (FLOATING HEARTS) ---
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
const maxParticles = 60;
const heartColors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#ffccd5', '#fae0e4'];

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Heart Particle Class
class HeartParticle {
    constructor(x, y, isBurst = false) {
        this.x = x || Math.random() * canvas.width;
        this.y = y || (canvas.height + 20);
        this.size = Math.random() * 15 + 10;
        this.speedY = isBurst ? (Math.random() * -4 - 1) : (Math.random() * -1.5 - 0.5);
        this.speedX = isBurst ? (Math.random() * 4 - 2) : (Math.random() * 1 - 0.5);
        this.opacity = 1;
        this.fadeRate = isBurst ? (Math.random() * 0.015 + 0.01) : (Math.random() * 0.003 + 0.001);
        this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
        this.swayAmplitude = Math.random() * 1.5 + 0.5;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.angle) * this.swayAmplitude;
        this.angle += this.swaySpeed;
        this.opacity -= this.fadeRate;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 30, this.size / 30);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        
        ctx.moveTo(0, -10);
        ctx.bezierCurveTo(-10, -25, -25, -15, -25, 5);
        ctx.bezierCurveTo(-25, 20, -10, 30, 0, 45);
        ctx.bezierCurveTo(10, 30, 25, 20, 25, 5);
        ctx.bezierCurveTo(25, -15, 10, -25, 0, -10);
        
        ctx.fill();
        ctx.restore();
    }
}

// Particle Loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (particles.length < maxParticles && Math.random() < 0.05) {
        particles.push(new HeartParticle());
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].opacity <= 0 || particles[i].y < -30) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Click to burst hearts
window.addEventListener('click', (e) => {
    if (e.target.closest('#musicToggle') || e.target.closest('#waxSeal') || e.target.closest('.dot')) return;

    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
        particles.push(new HeartParticle(e.clientX, e.clientY, true));
    }
});


// --- PHOTO SLIDER CONTROLLER ---
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const bgSlides = document.querySelectorAll('.bg-slide');
const sliderViewport = document.querySelector('.slides-container');
const prevArrow = document.querySelector('.slider-arrow-prev');
const nextArrow = document.querySelector('.slider-arrow-next');
let currentSlideIndex = 0;
let slideshowIntervalId = null;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeActive = false;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    bgSlides.forEach(bg => bg.classList.remove('active'));
    
    currentSlideIndex = (index + slides.length) % slides.length;
    slides[currentSlideIndex].classList.add('active');
    dots[currentSlideIndex].classList.add('active');
    if (bgSlides[currentSlideIndex]) {
        bgSlides[currentSlideIndex].classList.add('active');
    }
}


function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
}

function startSlideshow() {
    stopSlideshow();
    showSlide(0); // Reset to first slide
    slideshowIntervalId = setInterval(nextSlide, 3500); // Change photo every 3.5s
}

function stopSlideshow() {
    if (slideshowIntervalId) {
        clearInterval(slideshowIntervalId);
        slideshowIntervalId = null;
    }
}

function resetSlideshowTimer() {
    if (slideshowIntervalId) {
        startSlideshow();
    }
}

// Allow clicking dots to navigate
dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(index);
        resetSlideshowTimer();
    });
});

// Swipe gesture on the photo area to move between images
if (sliderViewport) {
    sliderViewport.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        swipeStartX = touch.clientX;
        swipeStartY = touch.clientY;
        swipeActive = true;
    }, { passive: true });

    sliderViewport.addEventListener('touchend', (e) => {
        if (!swipeActive) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - swipeStartX;
        const dy = touch.clientY - swipeStartY;
        swipeActive = false;

        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

        if (dx < 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        resetSlideshowTimer();
    }, { passive: true });
}

if (prevArrow) {
    prevArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
        resetSlideshowTimer();
    });
}

if (nextArrow) {
    nextArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
        resetSlideshowTimer();
    });
}


// --- ENVELOPE INTERACTION ---
const envelopeWrapper = document.querySelector('.envelope-wrapper');
const waxSeal = document.getElementById('waxSeal');
const letter = document.querySelector('.letter');

waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    envelopeWrapper.classList.add('open');
    startMusic();
    startSlideshow();
    
    // Heart burst at the wax seal location
    const rect = waxSeal.getBoundingClientRect();
    const sealX = rect.left + rect.width / 2;
    const sealY = rect.top + rect.height / 2;
    for (let i = 0; i < 15; i++) {
        particles.push(new HeartParticle(sealX, sealY, true));
    }
});

// Close triggers for the letter
const closeLetterBtnTop = document.getElementById('closeLetterBtnTop');
const closeLetterBtnBottom = document.getElementById('closeLetterBtnBottom');

function closeLetter(e) {
    e.stopPropagation();
    if (envelopeWrapper.classList.contains('open')) {
        envelopeWrapper.classList.remove('open');
        stopSlideshow();
    }
}

closeLetterBtnTop.addEventListener('click', closeLetter);
closeLetterBtnBottom.addEventListener('click', closeLetter);



// --- MUSIC BOX SYNTHESIZER (WEB AUDIO API) ---
let audioCtx = null;
let isPlaying = false;
let schedulerTimeoutId = null;

const noteFreqs = {
    'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50
};

const musicBoxNotes = [
    {bass: 'C3', treble: 'E5', beats: 1},
    {bass: 'G3', treble: null, beats: 1},
    {bass: 'C4', treble: 'G5', beats: 1},
    {bass: 'E4', treble: null, beats: 1},
    
    {bass: 'G2', treble: 'D5', beats: 1},
    {bass: 'D3', treble: null, beats: 1},
    {bass: 'G3', treble: 'B4', beats: 1},
    {bass: 'B3', treble: null, beats: 1},
    
    {bass: 'A2', treble: 'C5', beats: 1},
    {bass: 'E3', treble: null, beats: 1},
    {bass: 'A3', treble: 'E5', beats: 1},
    {bass: 'C4', treble: null, beats: 1},
    
    {bass: 'E2', treble: 'B4', beats: 1},
    {bass: 'B2', treble: null, beats: 1},
    {bass: 'E3', treble: 'G4', beats: 1},
    {bass: 'G3', treble: null, beats: 1},
    
    {bass: 'F2', treble: 'A4', beats: 1},
    {bass: 'C3', treble: null, beats: 1},
    {bass: 'F3', treble: 'C5', beats: 1},
    {bass: 'A3', treble: null, beats: 1},
    
    {bass: 'C2', treble: 'G4', beats: 1},
    {bass: 'G2', treble: null, beats: 1},
    {bass: 'C3', treble: 'E4', beats: 1},
    {bass: 'E3', treble: null, beats: 1},
    
    {bass: 'F2', treble: 'F4', beats: 1},
    {bass: 'C3', treble: null, beats: 1},
    {bass: 'F3', treble: 'A4', beats: 1},
    {bass: 'A3', treble: null, beats: 1},
    
    {bass: 'G2', treble: 'G4', beats: 1},
    {bass: 'D3', treble: null, beats: 1},
    {bass: 'G3', treble: 'B4', beats: 1},
    {bass: 'B3', treble: null, beats: 1}
];

let nextNoteTime = 0.0;
let noteIndex = 0;
const tempo = 135; 
const beatDuration = 60 / tempo; 
const scheduleAheadTime = 0.15;
const lookahead = 30.0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playMusicBoxNote(freq, time, volume = 0.15) {
    if (!freq) return;
    
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'triangle'; 
    osc2.type = 'sine';     
    
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 2, time); 
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start(time);
    osc2.start(time);
    
    osc1.stop(time + 2.0);
    osc2.stop(time + 2.0);
}

function scheduleNote(index, time) {
    const item = musicBoxNotes[index % musicBoxNotes.length];
    
    if (item.bass) {
        const bassFreq = noteFreqs[item.bass];
        playMusicBoxNote(bassFreq, time, 0.1);
    }
    
    if (item.treble) {
        const trebleFreq = noteFreqs[item.treble];
        playMusicBoxNote(trebleFreq, time, 0.16);
    }
}

function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
        scheduleNote(noteIndex, nextNoteTime);
        nextNoteTime += beatDuration;
        noteIndex++;
    }
    schedulerTimeoutId = setTimeout(scheduler, lookahead);
}

function startMusic() {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if (!isPlaying) {
        isPlaying = true;
        document.getElementById('musicToggle').classList.add('playing');
        nextNoteTime = audioCtx.currentTime + 0.05;
        noteIndex = 0;
        scheduler();
    }
}

function stopMusic() {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('musicToggle').classList.remove('playing');
        clearTimeout(schedulerTimeoutId);
    }
}

const musicToggle = document.getElementById('musicToggle');
musicToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();
    if (isPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});
