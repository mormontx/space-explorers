/* ============================================================
   SPACE EXPLORERS — PIXEL ART JavaScript
   All simulations rendered in retro 8-bit pixel style
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initStarfield();
  initStarLifecycle();
  initPlanetFormation();
  initOrbitSimulator();
  initPlanetaryDig();
  initBlackHole();
  initBlackHoleLensing();
  initGalaxyAnimations();
  initQACards();
  initFlightGame();
  initBigBangSimulator();
  initExoplanetSimulation();
});

/* ============================================================
   PIXEL HELPERS — shared utilities for pixel art rendering
   ============================================================ */

/** Draw a filled square (pixel block) instead of a circle */
function drawPixel(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  const s = Math.max(1, Math.round(size));
  ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
}

/** Disable anti-aliasing on a canvas for crisp pixels */
function setPixelMode(ctx) {
  ctx.imageSmoothingEnabled = false;
}

/** Snap a value to the nearest pixel grid for crispness */
function snap(v, grid) {
  return Math.round(v / grid) * grid;
}

/* ============================================================
   1. NAVIGATION
   ============================================================ */
function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    links.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Active section highlighting on scroll
  const sections = document.querySelectorAll('.section');
  const observerOptions = { rootMargin: '-50% 0px -50% 0px' };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, observerOptions);

  sections.forEach(s => sectionObserver.observe(s));
}

/* ============================================================
   2. SCROLL REVEAL ANIMATIONS
   ============================================================ */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  fadeElements.forEach(el => fadeObserver.observe(el));
}

/* ============================================================
   3. STARFIELD BACKGROUND — pixel art stars
   Square twinkling pixels with shooting stars
   ============================================================ */
function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  let width, height;
  const stars = [];
  const shootingStars = [];
  const STAR_COUNT = 250;
  let scrollY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    setPixelMode(ctx);
  }

  function createStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: snap(Math.random() * width, 2),
        y: snap(Math.random() * height, 2),
        size: Math.random() > 0.85 ? 4 : 2,
        // Twinkle at stepped intervals for pixel feel
        blinkRate: Math.floor(Math.random() * 80) + 30,
        blinkOffset: Math.floor(Math.random() * 100),
        depth: Math.floor(Math.random() * 3) + 1,
        color: Math.random() > 0.8 ? '#aaccff' : Math.random() > 0.5 ? '#ffffff' : '#8888aa'
      });
    }
  }

  function addShootingStar() {
    shootingStars.push({
      x: snap(Math.random() * width, 2),
      y: snap(Math.random() * height * 0.4, 2),
      speed: Math.floor(Math.random() * 6) + 4,
      life: 0,
      maxLife: 40
    });
  }

  window.addEventListener('scroll', () => { scrollY = window.pageYOffset; });

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, width, height);
    frame++;

    // Draw pixel stars
    stars.forEach(star => {
      // Stepped blink: on or off
      const isVisible = ((frame + star.blinkOffset) % star.blinkRate) < (star.blinkRate * 0.8);
      if (!isVisible) return;

      const parallaxY = (star.y - scrollY * 0.03 * star.depth) % height;
      const adjustedY = parallaxY < 0 ? parallaxY + height : parallaxY;

      drawPixel(ctx, star.x, adjustedY, star.size, star.color);

      // Glow cross for larger stars
      if (star.size >= 4) {
        ctx.fillStyle = 'rgba(150, 180, 255, 0.3)';
        ctx.fillRect(star.x - 1, adjustedY - 5, 2, 10);
        ctx.fillRect(star.x - 5, adjustedY - 1, 10, 2);
      }
    });

    // Shooting stars — pixel trail
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += ss.speed;
      ss.y += ss.speed * 0.6;
      ss.life++;

      if (ss.life > ss.maxLife) {
        shootingStars.splice(i, 1);
        continue;
      }

      const alpha = 1 - ss.life / ss.maxLife;
      // Draw trail as a series of pixel blocks
      for (let t = 0; t < 8; t++) {
        const tx = ss.x - t * ss.speed * 0.4;
        const ty = ss.y - t * ss.speed * 0.24;
        const a = alpha * (1 - t / 8);
        drawPixel(ctx, snap(tx, 2), snap(ty, 2), 2, `rgba(255, 255, 200, ${a})`);
      }
      // Head
      drawPixel(ctx, snap(ss.x, 2), snap(ss.y, 2), 3, `rgba(255, 255, 255, ${alpha})`);
    }

    if (Math.random() < 0.006) addShootingStar();

    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  window.addEventListener('resize', () => { resize(); createStars(); });
  requestAnimationFrame(draw);
}

/* ============================================================
   4. STAR LIFECYCLE SIMULATION — pixel particles
   ============================================================ */
function initStarLifecycle() {
  const canvas = document.getElementById('star-lifecycle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const nextBtn = document.getElementById('star-next-btn');
  const prevBtn = document.getElementById('star-prev-btn');
  const stageLabel = document.getElementById('star-stage-label');
  const stageInfo = document.getElementById('star-stage-info');

  const stages = [
    { name: 'NEBULA', info: 'A <strong>nebula</strong> is a giant cloud of gas and dust in space -- the birthplace of stars. Gravity slowly pulls material together over millions of years.', color: '#aa55ff' },
    { name: 'PROTOSTAR', info: 'As gas collapses, it heats up to form a <strong>protostar</strong>. It\'s not yet a true star -- nuclear fusion hasn\'t started. It glows from gravitational energy!', color: '#ff8c00' },
    { name: 'MAIN SEQUENCE', info: 'The core becomes hot enough (~15 million C) for <strong>nuclear fusion</strong> -- hydrogen fuses into helium, releasing enormous energy. Our Sun is in this stage!', color: '#ffff00' },
    { name: 'RED GIANT', info: 'When hydrogen runs out, the star expands dramatically into a <strong>red giant</strong>. It can grow 100x its original size! The outer layers cool and turn red.', color: '#ff3333' },
    { name: 'WHITE DWARF', info: 'After shedding its outer layers, an average star leaves behind a hot, dense core called a <strong>white dwarf</strong>. It glows faintly and cools down over billions of years.', color: '#ffffff' },
    { name: 'SUPERNOVA', info: 'Massive stars explode as a <strong>supernova</strong> -- one of the most powerful events in the universe! Smaller stars shed their layers and leave a tiny <strong>white dwarf</strong>.', color: '#00e5ff' }
  ];

  let currentStage = 0;
  let particles = [];
  let frame = 0;
  let isVisible = false;

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function generateParticles(stage) {
    particles = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const count = stage === 0 ? 150 : stage === 5 ? 120 : 80;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      let radius, size, speed;

      switch (stage) {
        case 0: radius = Math.random() * 160 + 20; size = Math.random() > 0.7 ? 4 : 2; speed = 0.15; break;
        case 1: radius = Math.random() * 100 + 10; size = Math.random() > 0.6 ? 4 : 2; speed = 0.3; break;
        case 2: radius = Math.random() * 50 + 5; size = Math.random() > 0.5 ? 3 : 2; speed = 0.1; break;
        case 3: radius = Math.random() * 180 + 20; size = Math.random() > 0.5 ? 4 : 3; speed = 0.08; break;
        case 4: radius = Math.random() * 5; size = 2; speed = 0.05; break;
        case 5: radius = Math.random() * 20; size = Math.random() > 0.5 ? 3 : 2; speed = Math.random() * 2 + 1; break;
      }

      particles.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: stage === 5 ? Math.cos(angle) * speed : (Math.random() - 0.5) * speed,
        vy: stage === 5 ? Math.sin(angle) * speed : (Math.random() - 0.5) * speed,
        size,
        angle,
        radius,
        alive: true
      });
    }
  }

  function updateTimeline() {
    document.querySelectorAll('.timeline-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentStage);
    });
  }

  function setStage(index) {
    currentStage = Math.max(0, Math.min(stages.length - 1, index));
    stageLabel.textContent = stages[currentStage].name;
    stageInfo.innerHTML = `<p>${stages[currentStage].info}</p>`;
    generateParticles(currentStage);
    updateTimeline();
  }

  nextBtn.addEventListener('click', () => setStage(currentStage + 1));
  prevBtn.addEventListener('click', () => setStage(currentStage - 1));

  document.querySelectorAll('.timeline-step').forEach(step => {
    step.addEventListener('click', () => {
      const stage = parseInt(step.dataset.stage);
      if (!isNaN(stage)) setStage(stage);
    });
  });

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);
    frame++;

    const color = stages[currentStage].color;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Central glow — drawn as concentric pixel squares
    if (currentStage >= 1) {
      const glowSize = currentStage === 3 ? 80 : currentStage === 2 ? 40 : 25;
      for (let r = glowSize; r > 0; r -= 4) {
        const alpha = (1 - r / glowSize) * 0.3;
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
    }


    // Particles as pixel squares
    if (currentStage >= 2 && currentStage !== 5) {
       // Solid shape pixelated
       let starRadius = currentStage === 2 ? 30 : currentStage === 3 ? 80 : 15;
       ctx.fillStyle = stages[currentStage].color;
       for (let y = -starRadius; y <= starRadius; y += 4) {
         for (let x = -starRadius; x <= starRadius; x += 4) {
           if (x*x + y*y <= starRadius*starRadius) {
             ctx.fillRect(cx + x, cy + y, 4, 4);
           }
         }
       }
    } else {
      particles.forEach(p => {
        if (!p.alive) return;

        if (currentStage === 5) {
          p.x += p.vx;
          p.y += p.vy;
          if (Math.abs(p.x - cx) > 250 || Math.abs(p.y - cy) > 250) p.alive = false;
        } else if (currentStage === 0) {
          p.x += Math.sin(frame * 0.008 + p.angle) * 0.3;
          p.y += Math.cos(frame * 0.008 + p.angle * 1.3) * 0.3;
        } else {
          p.angle += p.vx * 0.01;
          p.x = cx + Math.cos(p.angle) * p.radius;
          p.y = cy + Math.sin(p.angle) * p.radius;
        }

        drawPixel(ctx, snap(p.x, 2), snap(p.y, 2), p.size, color);
      });
    }

    // Stage label on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stages[currentStage].name, cx, canvas.height - 16);

    requestAnimationFrame(draw);
  }

  generateParticles(0);
  updateTimeline();
  requestAnimationFrame(draw);
}

/* ============================================================
   5. PLANET FORMATION — pixel accretion disk
   ============================================================ */
function initPlanetFormation() {
  const canvas = document.getElementById('planet-formation-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const addBtn = document.getElementById('planet-add-btn');
  const resetBtn = document.getElementById('planet-reset-btn');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  let particles = [];
  let clumps = [];
  let isVisible = false;

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  // 8-bit color palette for dust
  const dustColors = ['#aa8866', '#8888aa', '#997755', '#7799aa', '#bbaa88', '#6677aa'];

  function createInitialDisk() {
    particles = [];
    clumps = [];
    for (let i = 0; i < 180; i++) addParticle();
  }

  function addParticle() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 160 + 80; // Pushed out for bigger star
    const speed = 2.0 / Math.sqrt(dist / 50);

    particles.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: -Math.sin(angle) * speed,
      vy: Math.cos(angle) * speed,
      size: Math.random() > 0.7 ? 3 : 2,
      color: dustColors[Math.floor(Math.random() * dustColors.length)]
    });
  }

  addBtn.addEventListener('click', () => {
    for (let i = 0; i < 25; i++) addParticle();
    if (particles.length > 180 && Math.random() > 0.35) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 90 + 90; // Pushed out for bigger star
      const planetColors = ['#cc8844', '#88aacc', '#cc6644', '#44aa88', '#aaaa44'];
      clumps.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        angle, dist,
        size: Math.floor(Math.random() * 6) + 4,
        speed: 1.5 / Math.sqrt(dist / 50),
        color: planetColors[Math.floor(Math.random() * planetColors.length)]
      });
    }
  });

  resetBtn.addEventListener('click', createInitialDisk);

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);

    // Central protostar — pixel style
    const starSizes = [36, 26, 16, 8];
    const starColors = ['#332200', '#664400', '#cc8800', '#ffee88'];
    starSizes.forEach((s, i) => {
      ctx.fillStyle = starColors[i];
      ctx.fillRect(cx - s, cy - s, s * 2, s * 2);
    });

    // Update and draw particles
    particles.forEach(p => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 38) { // Only pull if outside the star
        const force = 0.5 / (dist * 0.1);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.999;
      p.vy *= 0.999;

      drawPixel(ctx, snap(p.x, 2), snap(p.y, 2), p.size, p.color);
    });

    // Protoplanets
    clumps.forEach(c => {
      c.angle += c.speed * 0.01;
      c.x = cx + Math.cos(c.angle) * c.dist;
      c.y = cy + Math.sin(c.angle) * c.dist;

      const s = Math.round(c.size);
      ctx.fillStyle = c.color;
      ctx.fillRect(Math.round(c.x - s), Math.round(c.y - s), s * 2, s * 2);

      // Border
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(c.x - s), Math.round(c.y - s), s * 2, s * 2);

      // Absorb nearby particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pdx = c.x - particles[i].x;
        const pdy = c.y - particles[i].y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < c.size + 5) {
          particles.splice(i, 1);
          c.size = Math.min(c.size + 0.12, 20);
        }
      }
    });

    requestAnimationFrame(draw);
  }

  createInitialDisk();
  requestAnimationFrame(draw);
}

/* ============================================================
   6. ORBIT SIMULATOR — pixel solar system
   ============================================================ */
function initOrbitSimulator() {
  const canvas = document.getElementById('orbit-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const slider = document.getElementById('speed-slider');
  const speedDisplay = document.getElementById('speed-display');
  let speedMultiplier = 1;
  let isVisible = false;

  // Info panel elements
  const infoPanel      = document.getElementById('planet-info-panel');
  const infoClose      = document.getElementById('planet-info-close');
  const infoSwatch     = document.getElementById('planet-info-swatch');
  const infoName       = document.getElementById('planet-info-name');
  const infoType       = document.getElementById('planet-info-type');
  const infoTemp       = document.getElementById('planet-info-temp');
  const infoAge        = document.getElementById('planet-info-age');
  const infoLifespan   = document.getElementById('planet-info-lifespan');
  const infoFormation  = document.getElementById('planet-info-formation-text');

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  slider.addEventListener('input', () => {
    speedMultiplier = parseFloat(slider.value);
    speedDisplay.textContent = speedMultiplier.toFixed(1) + 'x';
  });

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Full planet data with science facts
  const planets = [
    {
      name: 'MERCURY', orbit: 50, size: 3, speed: 0.04, color: '#b5a89a',
      angle: Math.random() * Math.PI * 2,
      type: 'Rocky Planet',
      temp: '430 C (day) / -180 C (night)',
      age: '4.5 billion years',
      lifespan: '~5 billion more years (until the Sun becomes a red giant and swallows it)',
      formation: 'Formed from the solar nebula about 4.5 billion years ago. Being closest to the Sun, only heavy metals and silicates could condense here. It lost most of its lighter materials to solar wind early in its life.',
      moons: []
    },
    {
      name: 'VENUS', orbit: 75, size: 4, speed: 0.03, color: '#e8c77b',
      angle: Math.random() * Math.PI * 2,
      type: 'Rocky Planet',
      temp: '465 C (hottest planet!)',
      age: '4.5 billion years',
      lifespan: '~5 billion more years (consumed when the Sun expands)',
      formation: 'Formed similarly to Earth from rocky debris in the inner solar system. A runaway greenhouse effect caused by thick CO2 atmosphere trapped heat, making it even hotter than Mercury despite being further from the Sun.',
      moons: []
    },
    {
      name: 'EARTH', orbit: 105, size: 5, speed: 0.025, color: '#3388ff',
      angle: Math.random() * Math.PI * 2,
      type: 'Rocky Planet',
      temp: '15 C (average)',
      age: '4.54 billion years',
      lifespan: '~5 billion more years (oceans boil in ~1 billion years as the Sun brightens)',
      formation: 'Accreted from planetesimals in the habitable zone. A giant impact with a Mars-sized body (Theia) created the Moon about 4.5 billion years ago. Liquid water appeared within the first few hundred million years.',
      moons: [
        { name: 'THE MOON', orbit: 10, speed: 0.06, angle: Math.random() * Math.PI * 2, color: '#dddddd', size: 2,
          type: 'Natural Satellite', temp: '127 C (day) / -173 C (night)', age: '4.51 billion years',
          lifespan: 'Moving away from Earth at 3.8 cm per year — eventually it will be too far for total solar eclipses!',
          formation: 'Created when a Mars-sized body called Theia slammed into early Earth. The debris from this giant impact coalesced in orbit to form our Moon. It is the only other world humans have walked on.' }
      ]
    },
    {
      name: 'MARS', orbit: 135, size: 4, speed: 0.02, color: '#cc4422',
      angle: Math.random() * Math.PI * 2,
      type: 'Rocky Planet',
      temp: '-65 C (average)',
      age: '4.6 billion years',
      lifespan: '~5 billion more years (may survive the Sun\'s red giant phase)',
      formation: 'Formed from rocky material at the outer edge of the inner solar system. Jupiter\'s gravity starved Mars of building material, keeping it small. It once had a thicker atmosphere and liquid water on its surface.',
      moons: [
        { name: 'PHOBOS', orbit: 8, speed: 0.08, angle: Math.random() * Math.PI * 2, color: '#aaaaaa', size: 1,
          type: 'Captured Asteroid', temp: '-40 C', age: '4.5 billion years',
          lifespan: 'Will crash into Mars in about 50 million years or break apart into a ring!',
          formation: 'Likely a captured asteroid from the nearby asteroid belt. It orbits Mars faster than Mars rotates, meaning it rises in the west and sets in the east! Only 22 km across.' },
        { name: 'DEIMOS', orbit: 12, speed: 0.05, angle: Math.random() * Math.PI * 2, color: '#888888', size: 1,
          type: 'Captured Asteroid', temp: '-40 C', age: '4.5 billion years',
          lifespan: 'Slowly spiralling away from Mars — may eventually escape its orbit entirely.',
          formation: 'The smaller of Mars\' two moons, only 12 km across. Like Phobos, it is likely a captured asteroid. It takes 30 hours to orbit Mars.' }
      ]
    },
    {
      name: 'JUPITER', orbit: 185, size: 10, speed: 0.012, color: '#cc9966',
      angle: Math.random() * Math.PI * 2,
      type: 'Gas Giant',
      temp: '-110 C (cloud tops)',
      age: '4.6 billion years',
      lifespan: 'Billions of years beyond our Sun (will drift as a rogue planet after the Sun dies)',
      formation: 'First planet to form! Its rocky core grew large enough (10x Earth) to gravitationally capture massive amounts of hydrogen and helium gas from the solar nebula. It contains more mass than all other planets combined.',
      moons: [
        { name: 'IO', orbit: 16, speed: 0.045, angle: Math.random() * Math.PI * 2, color: '#ffee55', size: 2,
          type: 'Volcanic Moon', temp: '-130 C (surface) / 1,600 C (volcanoes)', age: '4.5 billion years',
          lifespan: 'Stable for billions of years but constantly resurfaced by volcanic eruptions.',
          formation: 'The most volcanically active body in the solar system! Jupiter\'s immense gravity squeezes and stretches Io through tidal heating, powering over 400 active volcanoes that shoot plumes 300 km high.' },
        { name: 'EUROPA', orbit: 20, speed: 0.035, angle: Math.random() * Math.PI * 2, color: '#ffddbb', size: 2,
          type: 'Ice Moon', temp: '-160 C (surface)', age: '4.5 billion years',
          lifespan: 'Its subsurface ocean could persist for billions of years, fuelled by tidal heating.',
          formation: 'Has a smooth ice shell hiding a salty ocean that contains more water than all of Earth\'s oceans combined! Tidal heating from Jupiter keeps the water liquid. One of the best candidates for alien life in our solar system.' },
        { name: 'GANYMEDE', orbit: 24, speed: 0.025, angle: Math.random() * Math.PI * 2, color: '#aaddff', size: 1,
          type: 'Ice/Rock Moon', temp: '-160 C', age: '4.5 billion years',
          lifespan: 'Billions of years — gravitationally stable in its orbit.',
          formation: 'The largest moon in the entire solar system — bigger than the planet Mercury! It is the only moon known to have its own magnetic field. Has a subsurface ocean sandwiched between layers of ice.' },
        { name: 'CALLISTO', orbit: 28, speed: 0.018, angle: Math.random() * Math.PI * 2, color: '#d8bfd8', size: 1,
          type: 'Ice/Rock Moon', temp: '-139 C', age: '4.5 billion years',
          lifespan: 'Billions of years — the most stable of the Galilean moons.',
          formation: 'The most heavily cratered object in the solar system — its surface has barely changed in 4 billion years! May have a subsurface ocean. A potential base for future human exploration of Jupiter\'s system.' }
      ]
    },
    {
      name: 'SATURN', orbit: 230, size: 8, speed: 0.009, color: '#ddcc88',
      angle: Math.random() * Math.PI * 2, ring: true,
      type: 'Gas Giant',
      temp: '-140 C (cloud tops)',
      age: '4.5 billion years',
      lifespan: 'Billions of years beyond our Sun (rings may disappear in ~100 million years)',
      formation: 'Formed similarly to Jupiter but further out where there was less material. Its famous rings are made of ice and rock, possibly from a destroyed moon or captured comet. Saturn is so light it would float in water!',
      moons: [
        { name: 'TITAN', orbit: 15, speed: 0.04, angle: Math.random() * Math.PI * 2, color: '#ffcc66', size: 2,
          type: 'Atmospheric Moon', temp: '-179 C', age: '~4.5 billion years',
          lifespan: 'Billions of years — its thick atmosphere protects the surface.',
          formation: 'The only moon in the solar system with a thick atmosphere (1.5x Earth\'s pressure!). Has lakes and rivers of liquid methane and ethane on its surface. Rain falls from orange skies. The Huygens probe landed here in 2005!' },
        { name: 'ENCELADUS', orbit: 21, speed: 0.03, angle: Math.random() * Math.PI * 2, color: '#ffffff', size: 1.5,
          type: 'Icy Geyser Moon', temp: '-201 C (surface)', age: '~4.5 billion years',
          lifespan: 'Its geysers may continue for millions of years, powered by tidal heating.',
          formation: 'A tiny moon with enormous geysers that shoot water ice into space from cracks near its south pole! The Cassini spacecraft flew through these plumes and detected organic molecules — another top candidate for life!' }
      ]
    },
    {
      name: 'URANUS', orbit: 265, size: 6, speed: 0.006, color: '#66aaaa',
      angle: Math.random() * Math.PI * 2,
      type: 'Ice Giant',
      temp: '-195 C (coldest atmosphere)',
      age: '4.5 billion years',
      lifespan: 'Billions of years beyond our Sun (will become a rogue ice giant)',
      formation: 'Formed closer to the Sun then migrated outward. A massive collision knocked it on its side -- it rotates at a 98-degree tilt! Made mostly of water, methane, and ammonia ices. Methane gives it its blue-green color.',
      moons: [
        { name: 'TITANIA', orbit: 12, speed: 0.035, angle: Math.random() * Math.PI * 2, color: '#e0ffff', size: 1.5,
          type: 'Icy Moon', temp: '-203 C', age: '~4.5 billion years',
          lifespan: 'Billions of years — gravitationally bound to Uranus.',
          formation: 'The largest moon of Uranus, named after the queen of fairies in Shakespeare\'s A Midsummer Night\'s Dream. Its surface shows enormous canyons up to 1,500 km long. May have a thin subsurface ocean.' },
        { name: 'MIRANDA', orbit: 16, speed: 0.025, angle: Math.random() * Math.PI * 2, color: '#ffffff', size: 1,
          type: 'Icy Moon', temp: '-187 C', age: '~4.5 billion years',
          lifespan: 'Billions of years.',
          formation: 'The strangest looking moon — its surface looks like it was shattered and reassembled! Has the tallest cliff in the solar system: Verona Rupes, a 20 km drop. Named after a character from Shakespeare\'s The Tempest.' }
      ]
    },
    {
      name: 'NEPTUNE', orbit: 295, size: 6, speed: 0.005, color: '#3355cc',
      angle: Math.random() * Math.PI * 2,
      type: 'Ice Giant',
      temp: '-200 C',
      age: '4.5 billion years',
      lifespan: 'Billions of years beyond our Sun (will become a rogue ice giant)',
      formation: 'The most distant planet, likely formed closer to the Sun and migrated outward. Has the strongest winds in the solar system (2,100 km/h). It rains diamonds deep in its atmosphere due to extreme pressure on carbon.',
      moons: [
        { name: 'TRITON', orbit: 12, speed: 0.032, angle: Math.random() * Math.PI * 2, color: '#ffffff', size: 2,
          type: 'Captured Dwarf Planet', temp: '-235 C (coldest surface in the solar system!)', age: '~4.5 billion years',
          lifespan: 'Will spiral into Neptune and be torn apart in about 3.6 billion years, possibly forming a ring.',
          formation: 'The only large moon that orbits its planet backwards (retrograde)! This means it was captured from the Kuiper Belt — it was once a dwarf planet like Pluto. Has active geysers that shoot nitrogen gas 8 km high.' },
        { name: 'PROTEUS', orbit: 16, speed: 0.022, angle: Math.random() * Math.PI * 2, color: '#aaddff', size: 1,
          type: 'Irregular Moon', temp: '-222 C', age: '~4.5 billion years',
          lifespan: 'Billions of years.',
          formation: 'One of the darkest objects in the solar system — it reflects very little sunlight. It is nearly as large as a sphere can get before gravity forces it into a round shape. Discovered by Voyager 2 in 1989.' }
      ]
    }
  ];

  const sunObj = {
    name: 'THE SUN', type: 'Yellow Dwarf Star', temp: '5,500 C (surface)', age: '4.6 billion years', lifespan: '~5 billion more years', formation: 'Born from a giant rotating cloud of gas and dust known as the solar nebula. Gravity pulled the material together into a dense core, igniting nuclear fusion.', color: '#ffdd44'
  };

  const asteroidBeltObj = {
    name: 'ASTEROID BELT',
    type: 'Circumstellar Disc of Debris',
    temp: '-73 C to -108 C (average)',
    age: '4.5 billion years',
    lifespan: 'Billions of years (stable orbit, though individual collisions occur constantly)',
    formation: 'Made of rocky and metallic leftovers from the solar system\'s formation. Jupiter\'s massive gravitational influence prevented these planetesimals from coalescing into a single planet, leaving them as a belt of individual bodies. It contains dwarf planets like Ceres!',
    color: '#7f7f7f'
  };

  // Swirling Asteroid Belt particles (between Mars and Jupiter)
  const asteroidBelt = [];
  const ASTEROID_COUNT = 150;
  for (let i = 0; i < ASTEROID_COUNT; i++) {
    // Distance between Mars (135) and Jupiter (185) -> roughly 150 to 170
    const orbitDist = 150 + Math.random() * 20; 
    asteroidBelt.push({
      orbit: orbitDist,
      angle: Math.random() * Math.PI * 2,
      speed: (0.015 / Math.sqrt(orbitDist / 150)) * (0.8 + Math.random() * 0.4),
      size: Math.random() > 0.8 ? 2 : 1, // 1x1 or 2x2 pixels
      color: Math.random() > 0.5 ? '#7f7f7f' : '#a9a9a9' // Slate/Grey rock colors
    });
  }

  let hoveredPlanet = null;
  let selectedPlanet = null;
  let frame = 0;

  // Helper: find current position of a moon (needs its parent planet position)
  function getMoonPos(p, m) {
    const px = cx + Math.cos(p.angle) * p.orbit;
    const py = cy + Math.sin(p.angle) * p.orbit;
    return { x: px + Math.cos(m.angle) * m.orbit, y: py + Math.sin(m.angle) * m.orbit };
  }

  // Mouse tracking for hover
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    hoveredPlanet = null;
    // Check moons first (smaller targets, higher priority)
    for (const p of planets) {
      if (p.moons) {
        for (const m of p.moons) {
          const mp = getMoonPos(p, m);
          if (Math.abs(mx - mp.x) < m.size + 5 && Math.abs(my - mp.y) < m.size + 5) {
            hoveredPlanet = m;
          }
        }
      }
    }
    // Then planets
    if (!hoveredPlanet) {
      if (Math.abs(mx - cx) < 26 && Math.abs(my - cy) < 26) {
        hoveredPlanet = sunObj;
      } else {
        planets.forEach(p => {
          const px = cx + Math.cos(p.angle) * p.orbit;
          const py = cy + Math.sin(p.angle) * p.orbit;
          if (Math.abs(mx - px) < p.size + 6 && Math.abs(my - py) < p.size + 6) {
            hoveredPlanet = p;
          }
        });
      }
    }
    // Finally, check asteroid belt
    if (!hoveredPlanet) {
      const distFromSun = Math.hypot(mx - cx, my - cy);
      if (distFromSun >= 147 && distFromSun <= 173) {
        hoveredPlanet = asteroidBeltObj;
      }
    }
    canvas.style.cursor = hoveredPlanet ? 'pointer' : 'default';
  });

  // Click to select planet and show info
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let clickedObj = null;
    // Check moons first (smaller targets, higher priority)
    for (const p of planets) {
      if (p.moons) {
        for (const m of p.moons) {
          const mp = getMoonPos(p, m);
          if (Math.abs(mx - mp.x) < m.size + 6 && Math.abs(my - mp.y) < m.size + 6) {
            clickedObj = m;
          }
        }
      }
    }
    // Then planets & sun
    if (!clickedObj) {
      if (Math.abs(mx - cx) < 28 && Math.abs(my - cy) < 28) {
        clickedObj = sunObj;
      } else {
        planets.forEach(p => {
          const px = cx + Math.cos(p.angle) * p.orbit;
          const py = cy + Math.sin(p.angle) * p.orbit;
          if (Math.abs(mx - px) < p.size + 8 && Math.abs(my - py) < p.size + 8) {
            clickedObj = p;
          }
        });
      }
    }
    // Finally, check asteroid belt
    if (!clickedObj) {
      const distFromSun = Math.hypot(mx - cx, my - cy);
      if (distFromSun >= 147 && distFromSun <= 173) {
        clickedObj = asteroidBeltObj;
      }
    }

    if (clickedObj) {
      // Toggle: clicking same object again closes the panel
      if (selectedPlanet === clickedObj) {
        closeInfoPanel();
      } else {
        selectedPlanet = clickedObj;
        showPlanetInfo(clickedObj);
      }
    }
  });

  // Close button
  infoClose.addEventListener('click', closeInfoPanel);

  function showPlanetInfo(p) {
    infoSwatch.style.background = p.color;
    infoName.textContent = p.name;
    infoType.textContent = p.type;
    infoTemp.textContent = p.temp;
    infoAge.textContent = p.age;
    infoLifespan.textContent = p.lifespan;
    infoFormation.textContent = p.formation;
    infoPanel.removeAttribute('hidden'); infoPanel.style.display = 'block';
  }

  function closeInfoPanel() {
    selectedPlanet = null;
    infoPanel.setAttribute('hidden', ''); infoPanel.style.display = 'none';
  }

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);
    frame++;

    // Sun — pixel style concentric squares
    const sunLayers = [
      { s: 20, c: '#331100' },
      { s: 14, c: '#663300' },
      { s: 10, c: '#cc8800' },
      { s: 6,  c: '#ffdd44' },
      { s: 3,  c: '#ffffcc' }
    ];
    sunLayers.forEach(l => {
      ctx.fillStyle = l.c;
      ctx.fillRect(cx - l.s, cy - l.s, l.s * 2, l.s * 2);
    });

    // Draw swirling Asteroid Belt
    asteroidBelt.forEach(ast => {
      ast.angle += ast.speed * speedMultiplier;
      const ax = cx + Math.cos(ast.angle) * ast.orbit;
      const ay = cy + Math.sin(ast.angle) * ast.orbit;
      ctx.fillStyle = ast.color;
      ctx.fillRect(Math.round(ax - ast.size / 2), Math.round(ay - ast.size / 2), ast.size, ast.size);
    });

    // Highlight Asteroid Belt if selected or hovered
    if (selectedPlanet === asteroidBeltObj) {
      const blinkOn = Math.floor(frame / 12) % 2 === 0;
      if (blinkOn) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 147, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 173, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffff00';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ASTEROID BELT', cx, cy - 182);
    } else if (hoveredPlanet === asteroidBeltObj) {
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 147, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 173, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#00e5ff';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ASTEROID BELT', cx, cy - 182);
    }

    planets.forEach(p => {


      p.angle += p.speed * speedMultiplier;
      const px = Math.round(cx + Math.cos(p.angle) * p.orbit);
      const py = Math.round(cy + Math.sin(p.angle) * p.orbit);

      // Planet — pixel square
      ctx.fillStyle = p.color;
      ctx.fillRect(px - p.size, py - p.size, p.size * 2, p.size * 2);

      // Saturn ring
      if (p.ring) {
        ctx.fillStyle = 'rgba(221, 204, 136, 0.5)';
        ctx.fillRect(px - p.size - 6, py - 1, (p.size + 6) * 2, 2);
      }

      // Moons — little pixels orbiting the planet
      if (p.moons) {
        p.moons.forEach(m => {
          m.angle += m.speed * speedMultiplier;
          const mxPos = Math.round(px + Math.cos(m.angle) * m.orbit);
          const myPos = Math.round(py + Math.sin(m.angle) * m.orbit);
          ctx.fillStyle = m.color;
          ctx.fillRect(mxPos - Math.floor(m.size/2), myPos - Math.floor(m.size/2), m.size, m.size);

          // Selected moon — blinking highlight
          if (selectedPlanet === m) {
            const blinkOn = Math.floor(frame / 12) % 2 === 0;
            if (blinkOn) {
              ctx.strokeStyle = '#ffff00';
              ctx.lineWidth = 1;
              ctx.strokeRect(mxPos - 4, myPos - 4, 8, 8);
            }
            ctx.fillStyle = '#ffff00';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(m.name, mxPos, myPos - 8);
          }
          // Hovered moon label
          else if (hoveredPlanet === m) {
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(mxPos - 4, myPos - 4, 8, 8);
            ctx.fillStyle = '#00e5ff';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(m.name, mxPos, myPos - 8);
          }
        });
      }

      // Selected planet — blinking highlight box
      if (selectedPlanet === p) {
        const blinkOn = Math.floor(frame / 12) % 2 === 0;
        if (blinkOn) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(px - p.size - 4, py - p.size - 4, (p.size + 4) * 2, (p.size + 4) * 2);
        }
        // Name always shown for selected
        ctx.fillStyle = '#ffff00';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, px, py - p.size - 10);
      }
      // Hover label (only if not selected)
      else if (hoveredPlanet === p) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - p.size - 3, py - p.size - 3, (p.size + 3) * 2, (p.size + 3) * 2);

        ctx.fillStyle = '#00e5ff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, px, py - p.size - 8);
      }
    });

    // Prompt text when no planet selected
    if (!selectedPlanet) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK A PLANET', cx, canvas.height - 16);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

/* ============================================================
   7. BLACK HOLE — pixel visualization
   ============================================================ */
function initBlackHole() {
  const canvas = document.getElementById('blackhole-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let frame = 0;
  let tilt = 0.3;
  let isVisible = false;
  let isDragging = false;
  let lastX = 0;

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  canvas.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; });
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      tilt = Math.max(0.1, Math.min(0.8, tilt + (e.clientX - lastX) * 0.002));
      lastX = e.clientX;
    }
  });
  canvas.addEventListener('mouseup', () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);

  // Background stars
  const bgStars = [];
  for (let i = 0; i < 120; i++) {
    bgStars.push({
      x: snap(Math.random() * canvas.width, 2),
      y: snap(Math.random() * canvas.height, 2),
      size: 2,
      brightness: Math.random() > 0.5 ? 1 : 0.5
    });
  }

  // Accretion disk particles
  const diskParticles = [];
  for (let i = 0; i < 250; i++) {
    diskParticles.push({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 100 + 35,
      speed: (1.8 / (Math.random() * 100 + 35)) * (0.8 + Math.random() * 0.4),
      size: Math.random() > 0.6 ? 3 : 2
    });
  }

  // Pixel color palette for accretion disk
  const diskColors = ['#ff4400', '#ff8800', '#ffcc00', '#ffee66', '#aaeeff', '#ffffff'];

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);
    frame++;

    const eventHorizonR = 30;

    // Background stars with simple lensing
    bgStars.forEach(s => {
      const dx = s.x - cx;
      const dy = s.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < eventHorizonR + 5) return;

      let drawX = s.x;
      let drawY = s.y;

      if (dist < 120) {
        const lensStrength = 1 - (dist - eventHorizonR) / (120 - eventHorizonR);
        const angle = Math.atan2(dy, dx);
        drawX += Math.cos(angle + Math.PI / 2) * lensStrength * 15;
        drawY += Math.sin(angle + Math.PI / 2) * lensStrength * 15;
      }

      const dimFactor = dist < 70 ? Math.max(0, (dist - eventHorizonR) / (70 - eventHorizonR)) : 1;
      const alpha = s.brightness * dimFactor;
      if (alpha > 0.1) drawPixel(ctx, snap(drawX, 2), snap(drawY, 2), s.size, `rgba(200, 210, 255, ${alpha})`);
    });

    // Accretion disk — back half
    drawDisk(false);

    // Black hole — concentric pixel squares
    const bhLayers = [
      { s: 40, c: 'rgba(30, 10, 50, 0.4)' },
      { s: 35, c: 'rgba(10, 0, 20, 0.7)' },
      { s: eventHorizonR, c: '#000000' }
    ];
    bhLayers.forEach(l => {
      ctx.fillStyle = l.c;
      ctx.fillRect(cx - l.s, cy - l.s, l.s * 2, l.s * 2);
    });

    // Event horizon border
    ctx.strokeStyle = '#aa55ff55';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - eventHorizonR, cy - eventHorizonR, eventHorizonR * 2, eventHorizonR * 2);

    // Photon ring pulse
    const pulseAlpha = (Math.floor(frame / 15) % 2 === 0) ? 0.3 : 0.15;
    ctx.strokeStyle = `rgba(255, 200, 100, ${pulseAlpha})`;
    ctx.strokeRect(cx - eventHorizonR - 2, cy - eventHorizonR - 2, (eventHorizonR + 2) * 2, (eventHorizonR + 2) * 2);

    // Accretion disk — front half
    drawDisk(true);

    function drawDisk(isFront) {
      diskParticles.forEach(p => {
        p.angle += p.speed * 0.02;

        const x = cx + Math.cos(p.angle) * p.dist;
        const y = cy + Math.sin(p.angle) * p.dist * tilt;

        const isInFront = Math.sin(p.angle) < 0;
        if (isFront !== isInFront) return;

        // Color based on distance (hotter closer in)
        const heatIdx = Math.min(diskColors.length - 1, Math.floor((1 - (p.dist - 35) / 100) * diskColors.length));
        const doppler = 0.5 + 0.5 * Math.cos(p.angle);

        if (doppler > 0.3) {
          drawPixel(ctx, snap(x, 2), snap(y, 2), p.size, diskColors[Math.max(0, heatIdx)]);
        }
      });
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

function initBlackHoleLensing() {
  const canvas = document.getElementById('blackhole-lensing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  let frame = 0;
  let isVisible = false;
  let mouseX = -100;
  let mouseY = -100;
  let mouseActive = false;

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  });
  canvas.addEventListener('mouseleave', () => {
    mouseActive = false;
  });

  const eventHorizonR = 40;
  const photonSphereR = 60;

  let photons = [];
  const bgStars = [];
  for (let i = 0; i < 80; i++) {
    bgStars.push({
      x: snap(Math.random() * canvas.width, 2),
      y: snap(Math.random() * canvas.height, 2),
      size: 2,
      brightness: Math.random() > 0.5 ? 1 : 0.4
    });
  }

  function spawnPhoton(x, y, vx, vy, color) {
    photons.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      speed: Math.hypot(vx, vy),
      color: color || '#ffea00',
      trail: [],
      isActive: true,
      isAbsorbed: false
    });
  }

  let absorptionParticles = [];
  function createAbsorptionParticles(x, y, color) {
     for (let i = 0; i < 8; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 40 + 20;
        absorptionParticles.push({
           x: x,
           y: y,
           vx: Math.cos(angle) * speed,
           vy: Math.sin(angle) * speed,
           life: 1.0,
           color: color
        });
     }
  }

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);
    frame++;

    ctx.fillStyle = '#ffffff';
    bgStars.forEach(s => {
      let dx = s.x - cx;
      let dy = s.y - cy;
      let d = Math.hypot(dx, dy);
      if (d < eventHorizonR) return;
      
      let alpha = s.brightness;
      if (d < photonSphereR) alpha *= 0.3;
      drawPixel(ctx, s.x, s.y, s.size, `rgba(255, 255, 255, ${alpha})`);
    });

    ctx.strokeStyle = 'rgba(170, 85, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let r = 80; r < 200; r += 30) {
       ctx.beginPath();
       ctx.arc(cx, cy, r, 0, Math.PI*2);
       ctx.stroke();
    }

    if (frame % 10 === 0 && photons.length < 40) {
       let sy = Math.random() * (canvas.height - 40) + 20;
       let colorChoices = ['#ffea00', '#00ffcc', '#ff00aa', '#00f6ff'];
       let col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
       spawnPhoton(canvas.width + 10, sy, -220, 0, col);
    }

    if (mouseActive && frame % 4 === 0 && photons.length < 60) {
       let dx = cx - mouseX;
       let dy = cy - mouseY;
       let dist = Math.hypot(dx, dy);
       if (dist > 30) {
          let vx = (dx / dist) * 220;
          let vy = (dy / dist) * 220;
          spawnPhoton(mouseX, mouseY, vx, vy, '#ffffff');
       }
    }

    const dt = 0.016;
    for (let i = photons.length - 1; i >= 0; i--) {
       let p = photons[i];

       if (p.isAbsorbed) {
          p.trail.shift();
          if (p.trail.length === 0) {
             photons.splice(i, 1);
             continue;
          }

          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let j = 0; j < p.trail.length; j++) {
             if (j === 0) ctx.moveTo(p.trail[j].x, p.trail[j].y);
             else ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.stroke();
          continue;
       }

       let dx = cx - p.x;
       let dy = cy - p.y;
       let dist2 = dx * dx + dy * dy;
       let dist = Math.sqrt(dist2);

       // 1. Inward radial unit vector
       let ux = dx / dist;
       let uy = dy / dist;

       // 2. Tangential unit vector in the direction of motion
       let rx = p.x - cx;
       let ry = p.y - cy;
       let cross = rx * p.vy - ry * p.vx;
       let rot = cross >= 0 ? 1 : -1;
       let tx = (-ry / dist) * rot;
       let ty = (rx / dist) * rot;

       // 3. Blend factor based on distance (start steering at 160px down to 50px)
       let blend = Math.max(0, Math.min(1, (160 - dist) / 110)); // 0 when far, 1 when close

       // Target direction: blend tangential swirling (94%) with radial pull (6%) to create a beautiful spiral
       let targetVx = tx * 0.94 + ux * 0.06;
       let targetVy = ty * 0.94 + uy * 0.06;

       // Normalize target direction
       let targetLen = Math.hypot(targetVx, targetVy);
       targetVx /= targetLen;
       targetVy /= targetLen;

       // Adjust velocity: blend current direction with target spiraling direction, steering stronger as we get closer
       let steerStrength = 4 + 16 * blend;
       let blendSpeed = steerStrength * dt;
       p.vx = p.vx * (1 - blendSpeed) + targetVx * p.speed * blendSpeed;
       p.vy = p.vy * (1 - blendSpeed) + targetVy * p.speed * blendSpeed;

       // Force speed of light to remain constant
       let speed = Math.hypot(p.vx, p.vy);
       p.vx = (p.vx / speed) * p.speed;
       p.vy = (p.vy / speed) * p.speed;

       // Move to new position
       p.x += p.vx * dt;
       p.y += p.vy * dt;

       // Check if new position is inside event horizon
       let newDist = Math.hypot(cx - p.x, cy - p.y);
       if (newDist <= eventHorizonR + 1) {
          createAbsorptionParticles(p.x, p.y, p.color);
          p.isAbsorbed = true;
          p.trail.push({ x: snap(p.x, 2), y: snap(p.y, 2) });
          continue;
       }

       p.trail.push({ x: snap(p.x, 2), y: snap(p.y, 2) });
       if (p.trail.length > 80) p.trail.shift();

       if (p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) {
          photons.splice(i, 1);
          continue;
       }

       ctx.strokeStyle = p.color;
       ctx.lineWidth = 2;
       ctx.beginPath();
       for (let j = 0; j < p.trail.length; j++) {
          if (j === 0) ctx.moveTo(p.trail[j].x, p.trail[j].y);
          else ctx.lineTo(p.trail[j].x, p.trail[j].y);
       }
       ctx.stroke();

       drawPixel(ctx, snap(p.x, 2), snap(p.y, 2), 3, '#ffffff');
    }

    for (let i = absorptionParticles.length - 1; i >= 0; i--) {
       let ap = absorptionParticles[i];
       ap.x += ap.vx * dt;
       ap.y += ap.vy * dt;
       ap.vx *= 0.9;
       ap.vy *= 0.9;
       ap.life -= dt * 2.5;

       if (ap.life <= 0) {
          absorptionParticles.splice(i, 1);
       } else {
          drawPixel(ctx, snap(ap.x, 2), snap(ap.y, 2), 2, ap.color);
       }
    }

    ctx.fillStyle = 'rgba(10, 5, 20, 0.4)';
    ctx.beginPath(); ctx.arc(cx, cy, eventHorizonR + 8, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath(); ctx.arc(cx, cy, eventHorizonR + 4, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(cx, cy, eventHorizonR, 0, Math.PI*2); ctx.fill();

    ctx.strokeStyle = 'rgba(255, 200, 100, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, photonSphereR, 0, Math.PI*2); ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 50, 0, 0.4)';
    ctx.beginPath(); ctx.arc(cx, cy, eventHorizonR, 0, Math.PI*2); ctx.stroke();

    if (mouseActive) {
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
       ctx.strokeRect(mouseX - 6, mouseY - 6, 12, 12);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

/* ============================================================
   8. GALAXY ANIMATIONS — pixel style
   ============================================================ */
function initGalaxyAnimations() {
  initGalaxy('galaxy-spiral-canvas', 'spiral');
  initGalaxy('galaxy-elliptical-canvas', 'elliptical');
  initGalaxy('galaxy-irregular-canvas', 'irregular');
}

function initGalaxy(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const cxG = canvas.width / 2;
  const cyG = canvas.height / 2;
  const stars = [];
  let frame = 0;
  let isVisible = false;

  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  const count = type === 'spiral' ? 2500 : 200;
  const starColors = type === 'spiral' ?   ['#8844ff', '#4400ff', '#00ccff', '#ffffff'] :
                     type === 'elliptical' ? ['#ffcc99', '#ffaa77', '#eecc88'] :
                                             ['#aaccff', '#ccaaff', '#ffaaaa'];

  for (let i = 0; i < count; i++) {
    const star = { size: Math.random() > 0.8 ? 3 : 2, colorIdx: Math.floor(Math.random() * starColors.length) };

    switch (type) {
      case 'spiral': {
        const numArms = 4;
        const arm = Math.floor(Math.random() * numArms);
        const layer = Math.random();
        let t;
        if (layer < 0.4) t = Math.random() * 2; // dense core
        else if (layer < 0.8) t = Math.random() * 4; // mid layer
        else t = Math.random() * 6; // outer wisps
        
        star.baseAngle = (arm * (Math.PI * 2 / numArms)) + t * 0.9;
        star.r = t * 22 + 5;
        star.spread = (Math.random() * 16 - 8) * (t / 2 + 0.5); 
        break;
      }
      case 'elliptical': {
        const angle = Math.random() * Math.PI * 2;
        const r = (Math.random() + Math.random()) * 45;
        star.baseAngle = angle;
        star.r = r;
        break;
      }
      case 'irregular': {
        const cluster = Math.random();
        let ox = 0, oy = 0;
        if (cluster < 0.3) { ox = -25; oy = -15; }
        else if (cluster < 0.6) { ox = 20; oy = 12; }
        else { ox = -5; oy = 25; }
        const sx = ox + (Math.random() - 0.5) * 50;
        const sy = oy + (Math.random() - 0.5) * 40;
        star.baseAngle = Math.atan2(sy, sx);
        star.r = Math.sqrt(sx*sx + sy*sy);
        break;
      }
    }
    stars.push(star);
  }

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);
    frame++;

    // Center glow — pixel squares
    const glowColor = type === 'spiral' ? '#8844ff' : type === 'elliptical' ? '#ffbb77' : '#8888ff';
    for (let r = 20; r > 0; r -= 4) {
      const alpha = (1 - r / 20) * 0.2;
      ctx.fillStyle = glowColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(cxG - r, cyG - r, r * 2, r * 2);
    }

    const time = type === 'spiral' ? frame * 0.006 : frame * 0.003;

    stars.forEach(s => {
      let drawX, drawY;

      switch (type) {
        case 'spiral': {
          const angle = s.baseAngle + time;
          drawX = cxG + Math.cos(angle) * s.r + Math.cos(angle + Math.PI / 2) * s.spread;
          drawY = cyG + Math.sin(angle) * s.r * 0.5 + Math.sin(angle + Math.PI / 2) * s.spread * 0.5;
          break;
        }
        case 'elliptical': {
          const angle = s.baseAngle + time * 0.5;
          drawX = cxG + Math.cos(angle) * s.r;
          drawY = cyG + Math.sin(angle) * s.r * 0.6;
          break;
        }
        case 'irregular': {
          const angle = s.baseAngle + time * 0.3;
          drawX = cxG + Math.cos(angle) * s.r;
          drawY = cyG + Math.sin(angle) * s.r;
          break;
        }
      }

      drawPixel(ctx, snap(drawX, 2), snap(drawY, 2), s.size, starColors[s.colorIdx]);
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

/* ============================================================
   9. Q&A FLIP CARDS
   ============================================================ */
function initQACards() {
  const cards = document.querySelectorAll('.qa-card');

  cards.forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

/* ============================================================
   10. PLANETARY DIG — Minecraft style block digging
   ============================================================ */
function initPlanetaryDig() {
  const canvas = document.getElementById('dig-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const shovel = document.getElementById('dig-shovel');
  const prevBtn = document.getElementById('dig-prev');
  const nextBtn = document.getElementById('dig-next');
  const nameLabel = document.getElementById('dig-planet-name');
  const progressVal = document.getElementById('dig-progress-val');
  const progressFill = document.getElementById('dig-progress-fill');
  const formationCard = document.getElementById('dig-formation-card');
  const formationText = document.getElementById('dig-formation-text');

  let isVisible = false;
  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  const digPlanets = [
    {
      name: 'MERCURY',
      crustColors: ['#8c8c8c', '#a0a0a0', '#737373', '#b3b3b3'],
      coreColor: '#ffaa00',
      formationSteps: [
        'Mercury started as a rocky protoplanet in the inner solar system.',
        'It has an unusually massive iron core for its size.',
        'Scientists believe a giant impact early in its history stripped away its outer rocky mantle...',
        '...leaving mostly the heavy metallic core behind!'
      ]
    },
    {
      name: 'VENUS',
      crustColors: ['#d9a05b', '#e6b873', '#cc8844', '#f2d099'],
      coreColor: '#ff3300',
      formationSteps: [
        'Venus is made of rock and metal, just like Earth.',
        'It formed from the accretion of similar planetesimals.',
        'However, it lacks plate tectonics to release internal heat.',
        'Pressure builds up inside until massive, planet-wide volcanic eruptions reshape the entire surface!'
      ]
    },
    {
      name: 'EARTH',
      crustColors: ['#2b82c9', '#3e9ce6', '#4caf50', '#8bc34a', '#ffffff'],
      coreColor: '#ff0000',
      formationSteps: [
        'Earth formed as a molten mass of rock.',
        'As it cooled, the heaviest elements (iron and nickel) sank to the center to form the core.',
        'Lighter silicates floated up to form the crust and mantle.',
        'The spinning liquid outer core creates our protective magnetic field!'
      ]
    },
    {
      name: 'MARS',
      crustColors: ['#cc4422', '#e65c33', '#b3361a', '#f27950'],
      coreColor: '#883311',
      formationSteps: [
        'Mars is covered in iron oxide (rust), giving it its red color!',
        'Because it is smaller than Earth, it cooled much faster.',
        'Its core is likely partially liquid, but it lost its global magnetic field billions of years ago...',
        '...which allowed the solar wind to strip away its thick atmosphere.'
      ]
    },
    {
      name: 'JUPITER',
      crustColors: ['#cca877', '#e6c899', '#b38d59', '#f2dca6', '#ffffff'],
      coreColor: '#aaddff', /* Metallic hydrogen representation */
      formationSteps: [
        'Jupiter is a Gas Giant that started with a rocky/icy core about 10x Earth\'s mass.',
        'Its gravity was so strong it swept up massive amounts of hydrogen and helium gas.',
        'It grew fast, stopping other nearby planets from getting too big.',
        'Deep inside, the pressure is so high that hydrogen turns into a liquid metal!'
      ]
    },
    {
      name: 'SATURN',
      crustColors: ['#e6d599', '#f2e6b3', '#ccb877', '#fff2cc'],
      coreColor: '#ccddff',
      formationSteps: [
        'Saturn formed much like Jupiter but further out where gas was less dense.',
        'Because there was less material, it didn\'t grow quite as large.',
        'It has a small rocky core surrounded by a deep layer of metallic hydrogen...',
        '...and an outer layer of molecular hydrogen and helium.'
      ]
    },
    {
      name: 'URANUS',
      crustColors: ['#73c2cc', '#8cd9e6', '#59a6b3', '#a6ecf2'],
      coreColor: '#333333', /* Rocky core surrounded by ice */
      formationSteps: [
        'Uranus is an Ice Giant with a small rocky core.',
        'The core is surrounded by a hot, dense fluid of "icy" materials: water, methane, and ammonia.',
        'It likely formed closer to the Sun and then migrated outward.',
        'It was knocked on its side by a colossal collision early in its history!'
      ]
    },
    {
      name: 'NEPTUNE',
      crustColors: ['#2b5cc9', '#3e73e6', '#1a40b3', '#598bf2'],
      coreColor: '#222222',
      formationSteps: [
        'Neptune formed in a similar way to Uranus.',
        'It has a mantle of water, ammonia, and methane under extreme pressure and temperature.',
        'This pressure causes carbon atoms to condense into solid crystals...',
        '...which means it literally rains diamonds down toward the rocky core!'
      ]
    }
  ];

  let currentIdx = 2; // Start on Earth
  
  // Grid config
  const BLOCK_SIZE = 24; // Pixel size of each block
  const GRID_COLS = Math.ceil(canvas.width / BLOCK_SIZE);
  const GRID_ROWS = Math.ceil(canvas.height / BLOCK_SIZE);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const planetRadius = 240;
  const coreRadius = 100;

  let blocks = [];
  let totalBlocks = 0;
  let removedBlocks = 0;
  let isDigging = false;
  let coreRevealed = false;

  function initGrid() {
    const p = digPlanets[currentIdx];
    nameLabel.textContent = p.name;
    formationCard.hidden = true;
    formationText.innerHTML = '';
    coreRevealed = false;
    removedBlocks = 0;
    progressVal.textContent = '0%';
    progressFill.style.width = '0%';
    blocks = [];
    totalBlocks = 0;

    for (let r = 0; r < GRID_ROWS; r++) {
      blocks[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const bx = c * BLOCK_SIZE + BLOCK_SIZE / 2;
        const by = r * BLOCK_SIZE + BLOCK_SIZE / 2;
        const dist = Math.sqrt(Math.pow(bx - cx, 2) + Math.pow(by - cy, 2));
        
        // Only add blocks within the planet radius and OUTSIDE the core radius
        if (dist <= planetRadius && dist >= coreRadius - BLOCK_SIZE/2) {
          blocks[r][c] = {
            active: true,
            color: p.crustColors[Math.floor(Math.random() * p.crustColors.length)]
          };
          totalBlocks++;
        } else {
          blocks[r][c] = { active: false };
        }
      }
    }
    
    // In case there are no blocks (shouldn't happen with these numbers)
    if (totalBlocks === 0) totalBlocks = 1;
    drawGrid();
  }

  function drawGrid() {
    if (!isVisible) return;
    const p = digPlanets[currentIdx];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPixelMode(ctx);

    // Draw the core (always visible underneath)
    ctx.fillStyle = p.coreColor;
    
    // Draw a blocky core
    const coreCells = Math.ceil(coreRadius / BLOCK_SIZE);
    const centerC = Math.floor(GRID_COLS / 2);
    const centerR = Math.floor(GRID_ROWS / 2);
    
    for (let r = -coreCells; r <= coreCells; r++) {
      for (let c = -coreCells; c <= coreCells; c++) {
        if (Math.sqrt(r*r + c*c) <= coreCells - 0.5) {
           ctx.fillRect((centerC + c) * BLOCK_SIZE, (centerR + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
           // Core texture
           ctx.fillStyle = 'rgba(0,0,0,0.1)';
           ctx.fillRect((centerC + c) * BLOCK_SIZE, (centerR + r) * BLOCK_SIZE, BLOCK_SIZE/2, BLOCK_SIZE/2);
           ctx.fillStyle = p.coreColor;
        }
      }
    }

    // (Core glow removed)
    
    // Draw the active crust blocks
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (blocks[r][c].active) {
          const bx = c * BLOCK_SIZE;
          const by = r * BLOCK_SIZE;
          ctx.fillStyle = blocks[r][c].color;
          ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
          
          // Pixel border for block
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(bx, by + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
          ctx.fillRect(bx + BLOCK_SIZE - 2, by, 2, BLOCK_SIZE);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(bx, by, BLOCK_SIZE, 2);
          ctx.fillRect(bx, by, 2, BLOCK_SIZE);
        }
      }
    }
    
    // If core revealed, draw a pulsing "CORE" text
    if (coreRevealed) {
      const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 200);
      ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE', cx, cy);
    }
  }

  function digAt(x, y) {
    const c = Math.floor(x / BLOCK_SIZE);
    const r = Math.floor(y / BLOCK_SIZE);
    
    // Dig radius of roughly 2 blocks
    let blocksRemovedThisTick = 0;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (Math.sqrt(dr*dr + dc*dc) > 2.5) continue;
        
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
          if (blocks[nr][nc].active) {
            blocks[nr][nc].active = false;
            blocksRemovedThisTick++;
          }
        }
      }
    }

    if (blocksRemovedThisTick > 0) {
      removedBlocks += blocksRemovedThisTick;
      const progress = Math.min(100, Math.floor((removedBlocks / totalBlocks) * 100));
      progressVal.textContent = progress + '%';
      progressFill.style.width = progress + '%';
      
      const steps = digPlanets[currentIdx].formationSteps;
      let visibleSteps = [];
      if (progress > 20) visibleSteps.push(steps[0]);
      if (progress > 45) visibleSteps.push(steps[1]);
      if (progress > 70) visibleSteps.push(steps[2]);
      if (progress > 90) {
        visibleSteps.push(steps[3]);
        coreRevealed = true;
      } else {
        coreRevealed = false;
      }
      
      if (visibleSteps.length > 0) {
        formationCard.hidden = false;
        formationText.innerHTML = visibleSteps.join('<br><br>');
      }
      
      drawGrid();
    }
  }

  // Mouse / Touch events for digging and custom cursor
  canvas.addEventListener('mousedown', (e) => {
    isDigging = true;
    shovel.style.transform = 'translate(-10%, -90%) rotate(-30deg)'; // Swing shovel
    handleInteraction(e);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    // Update custom cursor position
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    shovel.style.left = x + 'px';
    shovel.style.top = y + 'px';
    
    if (isDigging) {
      handleInteraction(e);
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDigging = false;
    shovel.style.transform = 'translate(-10%, -90%) rotate(0deg)';
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDigging = false;
  });

  function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    digAt(x, y);
  }

  // Navigation
  prevBtn.addEventListener('click', () => {
    currentIdx = (currentIdx - 1 + digPlanets.length) % digPlanets.length;
    initGrid();
  });
  
  nextBtn.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % digPlanets.length;
    initGrid();
  });

  initGrid();
  
  // Animation loop just to handle core pulsing if revealed
  function animate() {
    if (isVisible && coreRevealed) {
      drawGrid();
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* ============================================================
   11. ARCADE GAME: TEST YOUR FLIGHT
   ============================================================ */
function initFlightGame() {
  const canvas = document.getElementById('flight-game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const startOverlay = document.getElementById('flight-overlay');
  const startBtn = document.getElementById('flight-start-btn');
  const overlayTitle = document.getElementById('flight-overlay-title');
  const overlayText = document.getElementById('flight-overlay-text');

  const gameHud = document.getElementById('game-hud');
  const hudLevel = document.getElementById('hud-level-text');
  const hudScore = document.getElementById('hud-score-text');
  const hudHealth = document.getElementById('ship-health-bar');
  const hudObjective = document.getElementById('hud-objective-text');

  const jumpscareOverlay = document.getElementById('jumpscare-overlay');
  
  // Preload jumpscare images to avoid blank screens during trigger
  const jumpscareImagesList = ['assets/jumpscare.png', 'assets/jumpscare_grey.png', 'assets/jumpscare_nordic.png', 'assets/jumpscare_mantis.png', 'assets/jumpscare_reptilian.png', 'assets/jumpscare_cybernetic.png', 'assets/jumpscare_deepsea.png', 'assets/jumpscare_shadow.png', 'assets/jumpscare_crystal.png'];
  jumpscareImagesList.forEach(src => {
     const img = new Image();
     img.src = src;
  });
  
  const quizModal = document.getElementById('flight-quiz-modal');
  const quizTitle = document.getElementById('flight-quiz-title');
  const quizText = document.getElementById('flight-quiz-text');
  const quizInput = document.getElementById('flight-quiz-input');
  const quizSubmit = document.getElementById('flight-quiz-submit');
  const quizFeedback = document.getElementById('flight-quiz-feedback');

  let currentPlayerName = 'Anonymous';
  let leaderboard = [];
  if (window.db) {
    const q = window.query(window.collection(window.db, "leaderboard"), window.orderBy("score", "desc"), window.limit(5));
    window.onSnapshot(q, (snapshot) => {
      leaderboard = [];
      snapshot.forEach((doc) => {
        leaderboard.push(doc.data());
      });
      if (leaderboard.length === 0) {
        leaderboard.push({ name: 'Mr. Yildirim', score: 7830 });
      }
      updateLeaderboardUI();
    });
  }

  function updateLeaderboardUI() {
    const list1 = document.getElementById('leaderboard-list');
    const list2 = document.getElementById('about-leaderboard-list');
    
    let htmlContent = '';
    const topScores = leaderboard.sort((a, b) => b.score - a.score).slice(0, 5);
    const ranks = ['1ST', '2ND', '3RD', '4TH', '5TH'];
    const rankColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff'];
    
    for (let i = 0; i < 5; i++) {
       const rankHtml = `<td style="color: ${rankColors[i]}">${ranks[i]}</td>`;
       if (i < topScores.length) {
          const paddedScore = String(topScores[i].score).padStart(7, '0');
          let shortName = topScores[i].name.substring(0, 12).toUpperCase();
          htmlContent += `<tr>${rankHtml}<td style="color: #fff">${paddedScore}</td><td style="color: #0ff">${shortName}</td></tr>`;
       } else {
          htmlContent += `<tr>${rankHtml}<td style="color: #555">0000000</td><td style="color: #555">---</td></tr>`;
       }
    }
    
    if (list1) list1.innerHTML = htmlContent;
    if (list2) list2.innerHTML = htmlContent;
  }
  
  // Call once to populate
  updateLeaderboardUI();

  let gameState = 'START';
  let lastTime = 0;
  let ship = { x: 400, y: 500, vx: 0, vy: 0, speed: 250, size: 20, health: 100, lives: 3, score: 0, powerup: null, powerupTime: 0, gameStartTime: 0, triviaCorrect: 0, triviaTotal: 0 };
  let keys = {};
  let isPaused = false;
  let jumpscareDeck = [];
  
  let playerLasers = [];
  let enemyLasers = [];
  let entities = [];
  let particles = [];
  
  let levelTimer = 0;
  let shootCooldown = 0;
  
  let audioCtx = null;
  function initAudio() {
     if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
     if (audioCtx.state === 'suspended') audioCtx.resume();
  }
  function playSound(type) {
    if (!audioCtx) return;
    try {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'laser') {
         osc.type = 'square';
         osc.frequency.setValueAtTime(880, t);
         osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
         gain.gain.setValueAtTime(0.1, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
         osc.start(t); osc.stop(t + 0.1);
      } else if (type === 'explosion') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(100, t);
         osc.frequency.exponentialRampToValueAtTime(10, t + 0.2);
         gain.gain.setValueAtTime(0.2, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
         osc.start(t); osc.stop(t + 0.2);
      } else if (type === 'kill') {
         osc.type = 'square';
         osc.frequency.setValueAtTime(400, t);
         osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
         gain.gain.setValueAtTime(0.2, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
         osc.start(t); osc.stop(t + 0.1);
      } else if (type === 'slash') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(60, t);
         osc.frequency.linearRampToValueAtTime(40, t + 0.3);
         const osc2 = audioCtx.createOscillator();
         osc2.type = 'sine';
         osc2.frequency.setValueAtTime(200, t);
         osc2.frequency.exponentialRampToValueAtTime(50, t + 0.3);
         osc2.connect(gain);
         gain.gain.setValueAtTime(0.5, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
         osc.start(t); osc.stop(t + 0.3);
         osc2.start(t); osc2.stop(t + 0.3);
      } else if (type === 'jumpscare') {
         osc.type = 'sawtooth';
         osc.frequency.setValueAtTime(2000, t);
         osc.frequency.exponentialRampToValueAtTime(500, t + 0.5);
         const osc2 = audioCtx.createOscillator();
         osc2.type = 'square';
         osc2.frequency.setValueAtTime(2100, t);
         osc2.frequency.exponentialRampToValueAtTime(550, t + 0.5);
         osc2.connect(gain);
         gain.gain.setValueAtTime(0.5, t);
         gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
         osc.start(t); osc.stop(t + 0.5);
         osc2.start(t); osc2.stop(t + 0.5);
      }
    } catch(e) {}
  }

  const questionPool = [
    { q: "What is the initial stage of a star's life cycle before nuclear fusion ignites?", a: "Protostar" },
    { q: "What does a main sequence star like our Sun become when it runs out of hydrogen?", a: "Red Giant" },
    { q: "What dense, Earth-sized core is left behind after a low-mass star sheds its outer layers?", a: "White Dwarf" },
    { q: "What is the explosive death of a massive star called?", a: "Supernova" },
    { q: "What forms when a massive star collapses under its own gravity to a point of infinite density?", a: "Black Hole" },
    { q: "What super-dense, spinning remnant is left after a supernova of a massive star?", a: "Neutron Star" },
    { q: "What theory states the universe expanded from a single point of infinite density?", a: "Big Bang" },
    { q: "What is the observed increase in the wavelength of light from distant galaxies called?", a: "galactic redshift" },
    { q: "What force is responsible for the formation of stars and planets from nebulas?", a: "Gravity" },
    { q: "What process powers main sequence stars by converting hydrogen into helium?", a: "Nuclear Fusion" },
    { q: "What is the closest star to Earth after the Sun?", a: "Proxima Centauri" },
    { q: "What planet in our solar system has the most moons?", a: "Saturn" },
    { q: "What is the name of the largest volcano in the solar system, located on Mars?", a: "Olympus Mons" },
    { q: "What galaxy is on a collision course with the Milky Way?", a: "Andromeda" },
    { q: "What is the name of NASA's most powerful space telescope launched in 2021?", a: "James Webb" },
    { q: "What phenomenon occurs when a star's light bends around a massive object?", a: "Gravitational Lensing" },
    { q: "What is the boundary around a black hole beyond which nothing can escape?", a: "Event Horizon" },
    { q: "What planet is known as the 'Morning Star' or 'Evening Star'?", a: "Venus" },
    { q: "What type of galaxy has a spiral shape with a bar-shaped center?", a: "Barred Spiral" },
    { q: "What is the unit of distance equal to about 3.26 light-years?", a: "Parsec" },
    { q: "What is the name of Jupiter's largest moon, also the largest in the solar system?", a: "Ganymede" },
    { q: "What invisible substance makes up about 27% of the universe?", a: "Dark Matter" },
    { q: "What is the term for a rocky body orbiting the Sun, mostly found between Mars and Jupiter?", a: "Asteroid" },
    { q: "What is the outermost layer of the Sun's atmosphere called?", a: "Corona" },
    { q: "What space probe was the first human-made object to enter interstellar space?", a: "Voyager 1" },
    { q: "What is the hottest planet in our solar system?", a: "Venus" },
    { q: "What is the name of the dwarf planet discovered beyond Pluto in 2005?", a: "Eris" },
    { q: "What type of radiation makes up most of the cosmic microwave background?", a: "Microwave" },
    { q: "What is the term for two stars that orbit each other?", a: "Binary Star" },
    { q: "What element is the most abundant in the universe?", a: "Hydrogen" }
  ];
  let currentQuestions = [];
  let nextLevelCallback = null;
  let onCorrectQuizCallback = null;

  window.addEventListener('keydown', (e) => { initAudio();
    if (e.key === 'p' || e.key === 'P') {
       if (gameState.startsWith('LEVEL_') || gameState === 'TRAITOR_BOSS') {
          isPaused = !isPaused;
          if (!isPaused) {
             lastTime = performance.now();
          }
          return;
       }
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
      if (gameState !== 'QUIZ' && gameState !== 'START') e.preventDefault(); 
    }
    keys[e.key] = true;
    if (gameState === 'QUIZ' && e.key === 'Enter') checkQuizAnswer();
    if (gameState === 'TRAITOR_DIALOGUE' && e.key === 'Enter') { startTraitorBoss(); return; }
    
    if (gameState === 'BOSS_DIALOGUE' && e.key === 'Enter') { startLevel7(); return; }
    if (gameState === 'QUIZ' && e.key === 'Escape') {
       if (onCorrectQuizCallback) {
          quizModal.hidden = true;
          if (nextLevelCallback) nextLevelCallback();
       }
    }
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  startBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) {
       const trimmedName = nameInput.value.trim();
       if (!trimmedName) {
           alert("Please enter your name to start the game!");
           nameInput.focus();
           return;
       }
       currentPlayerName = trimmedName;
       nameInput.style.display = 'none';
    }
    const lbd = document.getElementById('leaderboard-container');
    if (lbd) lbd.style.display = 'none';
    
    resetGame();
    startOverlay.classList.add('hidden');
    gameHud.hidden = false;
    startLevel1();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
    canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  quizSubmit.addEventListener('click', checkQuizAnswer);

  function resetGame() {
    ship = { x: 400, y: 500, vx: 0, vy: 0, speed: 250, size: 20, health: 100, lives: 3, score: 0, powerup: null, powerupTime: 0, gameStartTime: 0, triviaCorrect: 0, triviaTotal: 0 };
    playerLasers = []; enemyLasers = []; entities = []; particles = [];
    currentQuestions = [...questionPool].sort(() => 0.5 - Math.random());
    updateHud();
  }

  function updateHud() {
    hudScore.textContent = `SCORE: ${ship.score}`;
    hudHealth.style.width = `${Math.max(0, ship.health)}%`;
    if (ship.health < 30) hudHealth.style.background = 'var(--pixel-orange)';
    else hudHealth.style.background = 'var(--pixel-green)';
    const livesSpan = document.getElementById('hud-lives-text');
    if (livesSpan) livesSpan.textContent = '❤️❤️❤️'.substring(0, Math.max(0, ship.lives) * 2);
  }

  function handleDeath() {
    if (ship.health <= 0 && ship.lives <= 0) return;
    ship.lives--;
    ship.isInvulnerable = true;
    ship.invulnerableTime = 2.0; // Invulnerable while dead
    updateHud();
    createExplosion(ship.x, ship.y, '#ff0000', 30);
    if (ship.lives <= 0) {
       ship.health = 0;
       setTimeout(() => gameOver(false), 2000);
    } else {
       ship.health = 0;
       hudObjective.textContent = 'SHIP DESTROYED! RESPAWNING...';
       setTimeout(() => {
          ship.health = 100;
          ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
          ship.isInvulnerable = true;
          ship.invulnerableTime = 3.0; // 3 seconds invulnerability post respawn
          if (gameState === 'LEVEL_6') entities.length = 0; // Clear rocks
          updateHud();
          hudObjective.textContent = '';
       }, 2000);
    }
  }

  let aimAngle = 0;
  let themeInterval = null;
  let level1SynthInterval = null;
  function playLevel1SynthTheme() {
       if (!audioCtx) return;
       if (level1SynthInterval) clearInterval(level1SynthInterval);
       let noteIndex = 0;
       const notes = [36, 36, 48, 36, 36, 45, 36, 43]; // pulsing bass synth
       level1SynthInterval = setInterval(() => {
           if (gameState !== 'LEVEL_1') return clearInterval(level1SynthInterval);
           const t = audioCtx.currentTime;
           let osc = audioCtx.createOscillator();
           let gain = audioCtx.createGain();
           osc.type = 'square';
           osc.frequency.value = 440 * Math.pow(2, (notes[noteIndex] - 69) / 12);
           
           let filter = audioCtx.createBiquadFilter();
           filter.type = 'lowpass';
           filter.frequency.setValueAtTime(800, t);
           filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);
           
           osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
           gain.gain.setValueAtTime(0.4, t);
           gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
           osc.start(t); osc.stop(t + 0.15);
           
           if (noteIndex % 2 === 0) { // kick drum
               let kick = audioCtx.createOscillator();
               let kGain = audioCtx.createGain();
               kick.frequency.setValueAtTime(150, t);
               kick.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
               kick.connect(kGain); kGain.connect(audioCtx.destination);
               kGain.gain.setValueAtTime(0.6, t);
               kGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
               kick.start(t); kick.stop(t + 0.1);
           }
           
           noteIndex = (noteIndex + 1) % notes.length;
       }, 200);
  }

  function playHeavyMetalTheme() {
       if (!audioCtx) return;
       if (themeInterval) clearInterval(themeInterval);
       let noteIndex = 0;
       const notes = [40, 40, 43, 40, 40, 45, 40, 46]; // Power chord riff
       themeInterval = setInterval(() => {
           if (gameState !== 'LEVEL_7') return clearInterval(themeInterval);
           const t = audioCtx.currentTime;
           let osc = audioCtx.createOscillator();
           let gain = audioCtx.createGain();
           osc.type = 'sawtooth';
           osc.frequency.value = 440 * Math.pow(2, (notes[noteIndex] - 69) / 12);
           osc.connect(gain); gain.connect(audioCtx.destination);
           gain.gain.setValueAtTime(0.3, t);
           gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
           osc.start(t); osc.stop(t + 0.2);
           
           if (noteIndex === 2 || noteIndex === 6) { // snare
               let noise = audioCtx.createOscillator();
               let nGain = audioCtx.createGain();
               noise.type = 'square';
               noise.frequency.value = 100;
               noise.connect(nGain); nGain.connect(audioCtx.destination);
               nGain.gain.setValueAtTime(0.4, t);
               nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
               noise.start(t); noise.stop(t + 0.1);
           }
           noteIndex = (noteIndex + 1) % notes.length;
       }, 200);
  }



  
  const cosmologyQuestions = [
    { q: "What is the primary evidence for the Big Bang?", a: ["Cosmic Microwave Background Radiation", "Starlight", "Solar Winds", "Asteroid Impacts"], c: 0 },
    { q: "What phenomenon shows that the universe is expanding?", a: ["Blue shift", "Red shift", "Green shift", "Doppler effect in sound"], c: 1 },
    { q: "What force is responsible for the formation of stars?", a: ["Electromagnetism", "Strong Nuclear Force", "Gravity", "Weak Nuclear Force"], c: 2 },
    { q: "What is the final stage of a low-mass star like our Sun?", a: ["Supernova", "Black Hole", "Neutron Star", "White Dwarf"], c: 3 },
    { q: "What do high-mass stars become after a supernova?", a: ["White Dwarf or Red Giant", "Black Hole or Neutron Star", "Protostar", "Planetary Nebula"], c: 1 },
    { q: "Which element is primarily fused in a main sequence star?", a: ["Helium", "Carbon", "Hydrogen", "Iron"], c: 2 },
    { q: "What mysterious substance makes up most of the universe's mass?", a: ["Dark Energy", "Antimatter", "Dark Matter", "Plasma"], c: 2 },
    { q: "What is causing the universe's expansion to accelerate?", a: ["Dark Matter", "Dark Energy", "Gravity", "Black Holes"], c: 1 },
    { q: "What is a large collection of billions of stars called?", a: ["Solar System", "Constellation", "Galaxy", "Nebula"], c: 2 },
    { q: "What is the name of our galaxy?", a: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], c: 1 }
  ];

  let lastJumpscareImage = '';

  function triggerJumpscareAndQuiz(nextCallback) {
    playSound('jumpscare');
    gameState = 'JUMPSCARE';
    nextLevelCallback = nextCallback;
    onCorrectQuizCallback = null;
    
    const jumpscareImages = ['assets/jumpscare.png', 'assets/jumpscare_grey.png', 'assets/jumpscare_nordic.png', 'assets/jumpscare_mantis.png', 'assets/jumpscare_reptilian.png', 'assets/jumpscare_cybernetic.png', 'assets/jumpscare_deepsea.png', 'assets/jumpscare_shadow.png', 'assets/jumpscare_crystal.png'];
    
    if (jumpscareDeck.length === 0) {
       let attempts = 0;
       do {
          jumpscareDeck = [...jumpscareImages];
          for (let i = jumpscareDeck.length - 1; i > 0; i--) {
             const j = Math.floor(Math.random() * (i + 1));
             [jumpscareDeck[i], jumpscareDeck[j]] = [jumpscareDeck[j], jumpscareDeck[i]];
          }
          attempts++;
       } while (jumpscareDeck[jumpscareDeck.length - 1] === lastJumpscareImage && attempts < 10);
    }
    
    if (jumpscareDeck.length > 1 && jumpscareDeck[jumpscareDeck.length - 1] === lastJumpscareImage) {
       [jumpscareDeck[jumpscareDeck.length - 1], jumpscareDeck[0]] = [jumpscareDeck[0], jumpscareDeck[jumpscareDeck.length - 1]];
    }
    
    const chosen = jumpscareDeck.pop();
    lastJumpscareImage = chosen;
    
    const imgEl = jumpscareOverlay.querySelector('img');
    if (imgEl) {
      imgEl.src = chosen;
      jumpscareOverlay.style.display = 'flex';
      jumpscareOverlay.hidden = false;
    }
    
    setTimeout(() => openQuizModal(false), 1000); // 1000ms gives slightly more time to see the face
  }
  
  function triggerTriviaPowerup() {
    let savedState = gameState;
    gameState = 'QUIZ';
    ship.triviaTotal++;
    onCorrectQuizCallback = () => {
       ship.triviaCorrect++;
       ship.score += 5000;
       ship.powerup = 'spread'; ship.powerupTime = 10;
       gameState = savedState;
       hudObjective.textContent = 'POWERUP + 5000 PTS! SPREAD SHOT!';
       setTimeout(() => { hudObjective.textContent = ''; }, 2000);
       updateHud();
       lastTime = performance.now();
       requestAnimationFrame(gameLoop);
    };
    nextLevelCallback = () => {
       gameState = savedState;
       hudObjective.textContent = 'MISSED POWERUP!';
       setTimeout(() => { hudObjective.textContent = ''; }, 2000);
       lastTime = performance.now();
       requestAnimationFrame(gameLoop);
    };
    openQuizModal(true);
  }

  function openQuizModal(isPowerup) {
    jumpscareOverlay.hidden = true;
    jumpscareOverlay.style.display = 'none';
    gameState = 'QUIZ';
    const qObj = currentQuestions.pop() || questionPool[0];
    quizTitle.textContent = isPowerup ? "DATA CUBE: TRIVIA POWER-UP!" : "COSMIC PUZZLE";
    quizText.textContent = qObj.q;
    quizInput.dataset.answer = qObj.a;
    quizInput.value = '';
    quizFeedback.textContent = '';
    quizModal.hidden = false;
    setTimeout(() => quizInput.focus(), 100);
  }

  function checkQuizAnswer() {
    const ans = quizInput.value.trim().toLowerCase();
    const correct = quizInput.dataset.answer.toLowerCase();
    if (ans === correct || ans === correct.replace(' ', '')) {
      quizFeedback.textContent = "CORRECT!";
      quizFeedback.className = "quiz-feedback feedback-success";
      setTimeout(() => {
        quizModal.hidden = true;
        if (onCorrectQuizCallback) onCorrectQuizCallback();
        else if (nextLevelCallback) nextLevelCallback();
      }, 1000);
    } else {
      quizFeedback.textContent = "INCORRECT!";
      quizFeedback.className = "quiz-feedback feedback-error";
      if (onCorrectQuizCallback) {
         // Missed powerup
         setTimeout(() => {
           quizModal.hidden = true;
           if (nextLevelCallback) nextLevelCallback();
         }, 1000);
      }
      setTimeout(() => { quizFeedback.classList.remove('feedback-error'); }, 300);
    }
  }

  function createExplosion(x, y, color='#ff8800', count=30) {
    for(let i=0; i<count; i++) {
      particles.push({ x: x, y: y, vx: (Math.random()-0.5)*300, vy: (Math.random()-0.5)*300, life: 1.0, color: color });
    }
  }

  // --- LEVEL MANAGERS ---
  function startLevel1() {
    gameState = 'LEVEL_1';
    hudLevel.textContent = 'LEVEL 1: PLANET DEFENSE';
    hudObjective.textContent = 'DEFEND EARTH! SHOOT THE HORDE!';
    setTimeout(() => { if (gameState === 'LEVEL_1') hudObjective.textContent = ''; }, 3000);
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    ship.gameStartTime = Date.now();
    
    playLevel1SynthTheme();
    
    // Spawn an alien horde
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        let offsetX = (Math.random() - 0.5) * 40;
        let offsetY = (Math.random() - 0.5) * 40;
        entities.push({ 
           type: 'alien', 
           x: 100 + col * 120 + offsetX, 
           y: -150 + row * 60 + offsetY, 
           speed: 40 + Math.random() * 60, 
           size: 20, 
           hp: 10,
           jitterX: Math.random() * Math.PI * 2,
           jitterY: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function startLevel2() {
    gameState = 'LEVEL_2';
    hudLevel.textContent = 'LEVEL 2: COMET TAIL SURFING';
    hudObjective.textContent = 'STAY INSIDE THE COMET TAIL TO CHARGE WARP DRIVE!';
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    ship.warpCharge = 0;
    
    // Spawn the comet entity
    entities.push({ type: 'comet', x: 200, y: 150, vx: 80, vy: 50, size: 30 });
  }

  function startLevel3() {
    gameState = 'LEVEL_3';
    hudLevel.textContent = 'LEVEL 3: ORBITAL SLINGSHOT';
    hudObjective.textContent = 'ENGINES DEAD! USE GRAVITY TO SLINGSHOT TO THE TOP!';
    setTimeout(() => { if (gameState === 'LEVEL_3') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 200; ship.y = 550; ship.vx = 100; ship.vy = -150;
    entities.push({
      type: 'planet',
      x: 400,
      y: 350,
      r: 50,
      m: 35000,
      color: '#33aa55',
      moons: [
        { orbitR: 85, moonR: 8, speed: 0.0015, color: '#88ccaa', initialAngle: 0 },
        { orbitR: 120, moonR: 6, speed: -0.001, color: '#aaccaa', initialAngle: Math.PI }
      ]
    });
    entities.push({
      type: 'planet',
      x: 200,
      y: 150,
      r: 60,
      m: 40000,
      color: '#5533aa',
      moons: [
        { orbitR: 100, moonR: 10, speed: 0.0008, color: '#9988dd', initialAngle: Math.PI / 2 }
      ]
    });
    entities.push({
      type: 'planet',
      x: 600,
      y: 200,
      r: 40,
      m: 25000,
      color: '#aa3355',
      moons: [
        { orbitR: 70, moonR: 6, speed: 0.002, color: '#dd8899', initialAngle: Math.PI * 1.5 }
      ]
    });
  }

  function startLevel4() {
    gameState = 'LEVEL_4';
    hudLevel.textContent = 'LEVEL 4: CONSTELLATIONS';
    hudObjective.textContent = 'FLY THROUGH THE STARS TO DRAW THE SIGIL! HURRY!';
    setTimeout(() => { if (gameState === 'LEVEL_4') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    const starPath = [
       {x: 400, y: 100}, {x: 480, y: 350}, {x: 250, y: 180}, 
       {x: 550, y: 180}, {x: 320, y: 350}, {x: 400, y: 100}
    ];
    ship.levelTimer = 15;
    ship.constellationStars = starPath;
    ship.currentStarIndex = 0;
    ship.trail = [];
    ship.alienSpawnTimer = 0;
  }

  let dungeonMap = [];
  let camera = { x: 0, y: 0 };
  let swordSwing = 0; // timer for sword animation
  let swordAngle = 0; // direction of last movement
  function startLevel5() {
    gameState = 'LEVEL_5';
    hudLevel.textContent = 'LEVEL 5: ZONE OF CHAOS';
    hudObjective.textContent = 'SURVIVE THE CELESTIAL ONSLAUGHT FOR 30 SECONDS!';
    setTimeout(() => { if (gameState === 'LEVEL_5') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = []; particles = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0; ship.size = 15;
    ship.survivalTimer = 30;
    levelTimer = 0;
  }

  
  function startLevel6() {
    gameState = 'LEVEL_6';
    hudLevel.textContent = 'LEVEL 6: SOLAR WIND SLALOM';
    hudObjective.textContent = 'SURVIVE THE CHAOTIC SOLAR WIND AND COLLECT 10 ENERGY CORES!';
    setTimeout(() => { if (gameState === 'LEVEL_6') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = []; particles = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    ship.coresCollected = 0;
  }

  
  function startTraitorDialogue() {
    gameState = 'TRAITOR_DIALOGUE';
    hudLevel.textContent = '';
    hudObjective.textContent = '';
  }

  function startTraitorBoss() {
    gameState = 'TRAITOR_BOSS';
    hudLevel.textContent = 'LEVEL 6: HUMAN TRAITOR';
    hudObjective.textContent = 'DEFEAT THE TRAITOR!';
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    entities.push({ type: 'traitor', x: 400, y: 100, hp: 200, maxHp: 200, size: 45 });
  }

  function startBossDialogue() {
    gameState = 'BOSS_DIALOGUE';
    hudLevel.textContent = '';
    hudObjective.textContent = '';
  }

  function startLevel7() {
    gameState = 'LEVEL_7';
    hudLevel.textContent = 'LEVEL 7: BLACK HOLE BOSS';
    
    hudObjective.textContent = 'DEFEAT IT! BEWARE OF TIME DILATION NEAR THE CENTER!';
    setTimeout(() => { if (gameState === 'LEVEL_7') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    ship.minionTimer = 0;
    entities.push({ 
       type: 'boss', 
       x: 400, 
       y: 150, 
       size: 60, 
       hp: 300, 
       maxHp: 300,
       bossState: 'idle',
       stateTimer: 2.0,
       chargeVx: 0,
       chargeVy: 0
    });
  }

  
  function playVictorySynth() {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (!AudioContext) return;
       const ctx = new AudioContext();
       const masterGain = ctx.createGain();
       masterGain.connect(ctx.destination);
       masterGain.gain.value = 0.3;

       const notes = [41.20, 41.20, 49.00, 55.00, 41.20, 41.20, 61.74, 55.00];
       let time = ctx.currentTime;
       for (let i = 0; i < 48; i++) {
           const osc = ctx.createOscillator();
           osc.type = 'sawtooth';
           osc.frequency.value = notes[i % notes.length];
           const gain = ctx.createGain();
           gain.gain.setValueAtTime(0.5, time);
           gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
           osc.connect(gain);
           gain.connect(masterGain);
           osc.start(time);
           osc.stop(time + 0.25);
           time += 0.25;
       }
       let ktime = ctx.currentTime;
       for(let i=0; i<24; i++) {
           const osc = ctx.createOscillator();
           osc.type = 'square';
           osc.frequency.setValueAtTime(150, ktime);
           osc.frequency.exponentialRampToValueAtTime(0.01, ktime + 0.1);
           const gain = ctx.createGain();
           gain.gain.setValueAtTime(0.8, ktime);
           gain.gain.exponentialRampToValueAtTime(0.01, ktime + 0.1);
           osc.connect(gain);
           gain.connect(masterGain);
           osc.start(ktime);
           osc.stop(ktime + 0.1);
           ktime += 0.5;
       }
  }

  function gameOver(win) {

    
    if (win) {
        // Calculate end-game bonuses
        let baseScore = ship.score;
        let elapsedSeconds = (Date.now() - ship.gameStartTime) / 1000;
        let speedBonus = Math.max(0, Math.floor(300000 - elapsedSeconds * 500));
        let healthBonus = Math.floor(ship.health * 1000);
        let livesBonus = Math.floor(ship.lives * 50000);
        let triviaBonus = ship.triviaCorrect * 5000;
        let perfectTrivia = (ship.triviaCorrect === ship.triviaTotal && ship.triviaTotal >= 3) ? 25000 : 0;
        
        let totalBonus = speedBonus + healthBonus + livesBonus + triviaBonus + perfectTrivia;
        ship.score += totalBonus;
        
        // Store breakdown for victory cinematic rendering
        window.scoreBreakdown = {
            baseScore: baseScore,
            speedBonus: speedBonus,
            healthBonus: healthBonus,
            livesBonus: livesBonus,
            triviaBonus: triviaBonus,
            perfectTrivia: perfectTrivia,
            finalScore: ship.score,
            elapsedSeconds: Math.floor(elapsedSeconds),
            triviaCorrect: ship.triviaCorrect,
            triviaTotal: ship.triviaTotal
        };

        gameState = 'VICTORY_CINEMATIC';
        if (!window.victoryAudioPlayed) {
            playVictorySynth();
            window.victoryAudioPlayed = true;
        }
        leaderboard.push({ name: currentPlayerName, score: ship.score });
        if (window.db) {
          window.addDoc(window.collection(window.db, "leaderboard"), {
            name: currentPlayerName, score: ship.score, date: new Date()
          }).then(() => renderLeaderboard()).catch(e => console.error("Error adding score", e));
        } else { renderLeaderboard(); }
        return; // Skip normal HTML overlay
    }
    
    gameState = 'GAME_OVER';

    gameHud.hidden = true;
    overlayTitle.textContent = "GAME OVER";
    overlayText.textContent = "Your ship was destroyed.";
    startBtn.textContent = "PLAY AGAIN";
    
    updateLeaderboardUI();
    
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.style.display = 'inline-block';
    const lbd = document.getElementById('leaderboard-container');
    if (lbd) lbd.style.display = 'block';
    
    startOverlay.classList.remove('hidden');
  }

  function drawShip(x, y) {
    if (ship.health <= 0) return;
    if (ship.isInvulnerable && Math.floor(performance.now() / 150) % 2 === 0) return;

    // Thruster exhaust trail (plasma flame)
    const isMoving = keys['ArrowUp'] || keys['w'] || keys['ArrowLeft'] || keys['a'] || keys['ArrowRight'] || keys['d'];
    const flameHeight = isMoving ? Math.random() * 15 + 10 : Math.random() * 6 + 3;
    
    let engineGrad = ctx.createLinearGradient(x, y + 15, x, y + 15 + flameHeight);
    engineGrad.addColorStop(0, '#ff33cc'); // hot bright pink flame to match bullet!
    engineGrad.addColorStop(0.5, '#ffaa00'); // orange
    engineGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = engineGrad;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 15);
    ctx.lineTo(x + 6, y + 15);
    ctx.lineTo(x, y + 15 + flameHeight);
    ctx.closePath();
    ctx.fill();

    // Secondary engines on wings
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 12);
    ctx.lineTo(x - 10, y + 12);
    ctx.lineTo(x - 12, y + 12 + flameHeight * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 10, y + 12);
    ctx.lineTo(x + 14, y + 12);
    ctx.lineTo(x + 12, y + 12 + flameHeight * 0.6);
    ctx.closePath();
    ctx.fill();

    // Wings (Dark grey slate metal base)
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.moveTo(x - 18, y + 10);
    ctx.lineTo(x - 8, y + 2);
    ctx.lineTo(x, y - 5);
    ctx.lineTo(x + 8, y + 2);
    ctx.lineTo(x + 18, y + 10);
    ctx.lineTo(x + 15, y + 14);
    ctx.lineTo(x - 15, y + 14);
    ctx.closePath();
    ctx.fill();

    // Wingtips / Laser cannons (Bright pink accents)
    ctx.fillStyle = '#ff33cc'; 
    ctx.fillRect(x - 19, y, 3, 12);
    ctx.fillRect(x + 16, y, 3, 12);

    // Fuselage / Central Nose cone (Light futuristic silver)
    let bodyGrad = ctx.createLinearGradient(x - 8, y, x + 8, y);
    bodyGrad.addColorStop(0, '#bdc3c7');
    bodyGrad.addColorStop(0.5, '#ecf0f1');
    bodyGrad.addColorStop(1, '#95a5a6');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 15);
    ctx.lineTo(x - 5, y - 12);
    ctx.lineTo(x, y - 20); // nose tip
    ctx.lineTo(x + 5, y - 12);
    ctx.lineTo(x + 8, y + 15);
    ctx.closePath();
    ctx.fill();

    // Canopy / Cockpit (Neon Cyan glass shield)
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 2);
    ctx.lineTo(x, y - 10);
    ctx.lineTo(x + 4, y - 2);
    ctx.lineTo(x + 3, y + 6);
    ctx.lineTo(x - 3, y + 6);
    ctx.closePath();
    ctx.fill();

    // Cockpit highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 2, y - 4, 2, 4);

    // Shield bubble if powered up
    if (ship.powerup) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI*2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }
  }

  function drawBoss(x, y, hp, maxHp) {
    // gold/yellow pasta whip-like tentacles (longer, waving)
    ctx.strokeStyle = '#ADFF2F'; // disgusting slimy green-yellow color
    ctx.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
        ctx.beginPath();
        let angle = (i / 12) * Math.PI * 2 + (Date.now() * 0.007);
        // Tentacle length oscillates to look like a whip stretching
        let whipLength = 110 + Math.sin(Date.now() * 0.015 + i) * 35; // ranges between 75 and 145
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
            x + Math.cos(angle) * (whipLength * 0.6), 
            y + Math.sin(angle) * (whipLength * 0.6), 
            x + Math.cos(angle + 0.6) * whipLength, 
            y + Math.sin(angle + 0.6) * whipLength
        );
        ctx.stroke();
    }

    // Left and right meatballs (disgusting green-brown slimy flesh)
    ctx.fillStyle = '#5c633c'; // Sickly green-brown
    ctx.beginPath(); ctx.arc(x - 20, y - 10, 28, 0, Math.PI*2); ctx.fill(); // left meatball
    ctx.beginPath(); ctx.arc(x + 20, y - 10, 28, 0, Math.PI*2); ctx.fill(); // right meatball
    
    // Dripping green slime drops
    ctx.fillStyle = 'rgba(173, 255, 47, 0.7)'; // translucent slime
    for (let i = 0; i < 3; i++) {
        let dropY = y + 10 + ((Date.now() * 0.05 + i * 20) % 30);
        let dropX = x + (i - 1) * 15;
        ctx.fillRect(dropX - 2, dropY, 4, 8);
        ctx.beginPath(); ctx.arc(dropX, dropY + 8, 3, 0, Math.PI*2); ctx.fill();
    }

    // Exaggerated red lipstick lips (huge smiling mouth of a woman, no teeth)
    ctx.fillStyle = '#ff003c'; // Vibrant bright red lipstick
    ctx.strokeStyle = '#8b0000'; // Dark red outline
    ctx.lineWidth = 3;
    
    // Upper lip with Cupid's bow
    ctx.beginPath();
    ctx.moveTo(x - 25, y + 5);
    ctx.quadraticCurveTo(x - 12, y - 8, x - 6, y - 2);
    ctx.quadraticCurveTo(x, y + 2, x + 6, y - 2);
    ctx.quadraticCurveTo(x + 12, y - 8, x + 25, y + 5);
    ctx.quadraticCurveTo(x, y + 10, x - 25, y + 5);
    ctx.fill();
    ctx.stroke();

    // Lower lip
    ctx.beginPath();
    ctx.moveTo(x - 25, y + 5);
    ctx.quadraticCurveTo(x, y + 30, x + 25, y + 5);
    ctx.quadraticCurveTo(x, y + 12, x - 25, y + 5);
    ctx.fill();
    ctx.stroke();

    // Smiling mouth cavity void (no teeth)
    ctx.fillStyle = '#6b001a';
    ctx.beginPath();
    ctx.moveTo(x - 21, y + 6);
    ctx.quadraticCurveTo(x, y + 24, x + 21, y + 6);
    ctx.quadraticCurveTo(x, y + 9, x - 21, y + 6);
    ctx.fill();
    
    // Animated Popping Eyes on Stalks
    let eyeOsc = Math.sin(Date.now() * 0.006); // Smooth wave
    let stalkHeight = 60 + eyeOsc * 20;        // Stalk length oscillates between 40 and 80
    let eyeRad = 10 + eyeOsc * 3;              // Eye size oscillates between 7 and 13
    
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 10, y - 20); ctx.lineTo(x - 30, y - stalkHeight); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 10, y - 20); ctx.lineTo(x + 30, y - stalkHeight); ctx.stroke();
    
    ctx.fillStyle = '#ffffff'; 
    ctx.beginPath(); ctx.arc(x - 30, y - stalkHeight, eyeRad, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 30, y - stalkHeight, eyeRad, 0, Math.PI*2); ctx.fill();
    
    ctx.fillStyle = '#000000'; 
    ctx.beginPath(); ctx.arc(x - 30, y - stalkHeight, eyeRad * 0.4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 30, y - stalkHeight, eyeRad * 0.4, 0, Math.PI*2); ctx.fill();



    // Health bar
    ctx.fillStyle = '#333'; ctx.fillRect(x - 50, y - 100, 100, 10);
    ctx.fillStyle = '#ff0000'; ctx.fillRect(x - 50, y - 100, 100 * (hp/maxHp), 10);
  }

  
  // Debug Panel Listeners


  function gameLoop(timestamp) {
    if (isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText("Press P to Resume", canvas.width / 2, canvas.height / 2 + 40);
      ctx.textAlign = 'left';
      lastTime = timestamp;
      requestAnimationFrame(gameLoop);
      return;
    }
    if (!gameState.startsWith('LEVEL_') && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC' && gameState !== 'TRAITOR_DIALOGUE' && gameState !== 'TRAITOR_BOSS') {
      if (gameState !== 'START' && gameState !== 'GAME_OVER' && gameState !== 'VICTORY') {
        lastTime = timestamp; 
        requestAnimationFrame(gameLoop);
      }
      return;
    }
    
    let dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (ship.powerupTime > 0) {
       ship.powerupTime -= dt;
       if (ship.powerupTime <= 0) ship.powerup = null;
    }

    if (ship.invulnerableTime > 0) {
       ship.invulnerableTime -= dt;
       if (ship.invulnerableTime <= 0) ship.isInvulnerable = false;
    }

    if (gameState === 'LEVEL_6') {
       // Time Dilation
       let dist = Math.hypot(canvas.width/2 - ship.x, canvas.height/2 - ship.y);
       if (dist < 200) {
          dt *= (dist / 200); // Slow down time closer to black hole
       }
    }

    if (false) {
       // 2D Side-Scrolling Platformer Engine
       let tileSize = 64;
       let gravity = 800 * dt;
       
       // Horizontal Movement
       let mSpeed = 300;
       let dx = 0;
       if (keys['ArrowLeft'] || keys['a']) { dx -= 1; ship.facingRight = false; }
       if (keys['ArrowRight'] || keys['d']) { dx += 1; ship.facingRight = true; }
       
       ship.vx = dx * mSpeed;
       
       // Jump
       if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && ship.grounded) {
          ship.vy = -550;
          ship.grounded = false;
          playSound('slash'); // use slash for jump sound
       }
       
       // Apply Gravity
       ship.vy += gravity;
       
       // Helper: Check solid
       function isSolid(x, y) {
          let tx = Math.floor(x / tileSize); let ty = Math.floor(y / tileSize);
          if (ty < 0 || ty >= dungeonMap.length || tx < 0 || tx >= dungeonMap[0].length) return false;
          let block = dungeonMap[ty][tx];
          return block === 1 || block === 2; // walls and riddle boxes are solid
       }
       
       // X Collision
       let nx = ship.x + ship.vx * dt;
       let halfW = 20; // player half width
       let halfH = 30; // player half height
       if (!isSolid(nx - halfW, ship.y - halfH) && !isSolid(nx + halfW, ship.y - halfH) &&
           !isSolid(nx - halfW, ship.y + halfH - 1) && !isSolid(nx + halfW, ship.y + halfH - 1)) {
           ship.x = nx;
       } else {
           ship.vx = 0;
       }
       
       // Y Collision
       let ny = ship.y + ship.vy * dt;
       ship.grounded = false;
       if (ship.vy > 0) { // falling
           if (!isSolid(ship.x - halfW, ny + halfH) && !isSolid(ship.x + halfW, ny + halfH)) {
               ship.y = ny;
           } else {
               ship.y = Math.floor((ny + halfH) / tileSize) * tileSize - halfH - 0.1;
               ship.vy = 0;
               ship.grounded = true;
           }
       } else { // jumping up
           if (!isSolid(ship.x - halfW, ny - halfH) && !isSolid(ship.x + halfW, ny - halfH)) {
               ship.y = ny;
           } else {
               ship.y = Math.floor(ship.y / tileSize) * tileSize + halfH + 0.1;
               ship.vy = 0;
               
               // Hit block from below!
               let tx = Math.floor(ship.x / tileSize);
               let ty = Math.floor((ship.y - halfH - 5) / tileSize);
               if (ty >= 0 && tx >= 0 && dungeonMap[ty][tx] === 2) {
                   // Hit Riddle Box
                   dungeonMap[ty][tx] = 0; // Destroy box
                   createExplosion(tx*tileSize + tileSize/2, ty*tileSize + tileSize/2, '#ffff00', 20);
                   triggerTriviaPowerup(); // Show riddle
                   ship.fuelCollected++;
                   ship.score += 2500;
                   updateHud();
               }
           }
       }
       
       // Death by falling
       if (ship.y > dungeonMap.length * tileSize + 100) {
           ship.health -= 100;
           if (ship.health <= 0) handleDeath();
       }

       // Exit Portal Collision
       let tx = Math.floor(ship.x / tileSize);
       let ty = Math.floor(ship.y / tileSize);
       if (ty >= 0 && tx >= 0 && tx < dungeonMap[0].length && ty < dungeonMap.length && dungeonMap[ty][tx] === 4) {
           if (ship.fuelCollected >= 4) {
               hudObjective.textContent = 'PORTAL ACTIVATED! WARPING...';
               gameState = 'TRANSITION';
               setTimeout(() => triggerJumpscareAndQuiz(startLevel6), 2000); // Transitions to Slalom
           } else {
               hudObjective.textContent = 'FIND MORE RIDDLE BOXES!';
           }
       }

       // Camera tracking (smooth side-scrolling)
       camera.x += (ship.x - canvas.width/2 - camera.x) * 5 * dt;
       camera.y += (ship.y - canvas.height/2 - camera.y) * 5 * dt;
       
       // Clamp camera to map bounds
       if (camera.x < 0) camera.x = 0;
       if (camera.y < 0) camera.y = 0;
       let maxCamX = dungeonMap[0].length * tileSize - canvas.width;
       if (camera.x > maxCamX) camera.x = maxCamX;

       // Draw
       ctx.save();
       ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
       
       // Draw Map
       for(let y=0; y<dungeonMap.length; y++) {
          for(let x=0; x<dungeonMap[0].length; x++) {
             let px = x * tileSize; let py = y * tileSize;
             if (px + tileSize < camera.x || px > camera.x + canvas.width || py + tileSize < camera.y || py > camera.y + canvas.height) continue;
             
             let type = dungeonMap[y][x];
             if (type === 1) {
                // Ground/Wall Platform
                ctx.fillStyle = '#555'; ctx.fillRect(px, py, tileSize, tileSize);
                ctx.fillStyle = '#333'; ctx.fillRect(px, py + tileSize - 10, tileSize, 10);
                ctx.strokeStyle = '#222'; ctx.strokeRect(px, py, tileSize, tileSize);
             } else if (type === 2) {
                // Riddle Box
                let rboxImg = document.getElementById('rbox-img');
                if (rboxImg && rboxImg.complete && rboxImg.naturalHeight !== 0) {
                    ctx.drawImage(rboxImg, px, py, tileSize, tileSize);
                } else {
                    ctx.fillStyle = '#ffaa00'; ctx.fillRect(px, py, tileSize, tileSize);
                    ctx.fillStyle = '#fff'; ctx.font = '30px monospace'; ctx.fillText('?', px+20, py+40);
                }
             } else if (type === 4) {
                // Exit Portal
                let glow = Math.sin(timestamp * 0.005) * 50 + 150;
                ctx.fillStyle = `rgb(${glow}, 50, 255)`; ctx.beginPath(); ctx.arc(px+tileSize/2, py+tileSize/2, 40, 0, Math.PI*2); ctx.fill();
             }
          }
       }

       // Draw Player Sprite
       if (ship.health > 0) {
           let astroImg = document.getElementById('astro-img');
           ctx.save();
           ctx.translate(ship.x, ship.y);
           if (!ship.facingRight) ctx.scale(-1, 1);
           
           if (astroImg && astroImg.complete && astroImg.naturalHeight !== 0) {
               ctx.drawImage(astroImg, -30, -45, 60, 90);
           } else {
               ctx.fillStyle = '#0ff'; ctx.fillRect(-20, -30, 40, 60);
           }
           ctx.restore();
       }
       ctx.restore();

       // HUD Overlay
       ctx.fillStyle = '#0f0'; ctx.font = '16px "Press Start 2P", monospace'; ctx.textAlign='left';
       ctx.fillText(`Riddles Found: ${ship.fuelCollected}/4`, 20, 30);

    } else {
       // 2D Renderer
       ctx.fillStyle = '#000011';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.fillStyle = '#ffffff';
       for(let i=0; i<50; i++) {
         let sx = (Math.sin(i*123) * 1000 + 1000) % canvas.width;
         let sy = ((Math.cos(i*321) * 1000) + timestamp*0.1) % canvas.height;
         if (sy < 0) sy += canvas.height;
         ctx.fillRect(sx, sy, 2, 2);
       }

       
       
       if (gameState === 'TRAITOR_DIALOGUE') {
           ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
           if (!window.traitorImg) { window.traitorImg = new Image(); window.traitorImg.src = 'assets/traitor_ship.png'; }
           if (window.traitorImg.complete) {
               ctx.drawImage(window.traitorImg, canvas.width/2 - 75, 50, 150, 150);
           }
           ctx.fillStyle = '#fff'; ctx.fillRect(100, 380, 600, 100);
           ctx.fillStyle = '#000'; ctx.font = '16px "Press Start 2P", monospace';
           ctx.fillText("FOOL! I have traded humanity", 120, 420);
           ctx.fillText("for ultimate cosmic power!", 120, 450);
           ctx.fillStyle = '#ff0'; ctx.font = '12px "Press Start 2P", monospace';
           ctx.fillText("PRESS ENTER TO FIGHT", 300, 550);
       }

       
    if (gameState === 'BOSS_DIALOGUE') {
           ctx.fillStyle = 'rgba(0,0,0,0.8)';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           
           if (!window.bossImg) { window.bossImg = new Image(); window.bossImg.src = 'assets/boss_portrait.png'; }
           if (window.bossImg.complete) ctx.drawImage(window.bossImg, canvas.width/2 - 150, 50, 300, 300);
           
           ctx.fillStyle = '#fff'; ctx.fillRect(100, 380, 600, 100);
           ctx.fillStyle = '#000'; ctx.font = '16px "Press Start 2P", monospace';
           ctx.fillText("You come so far so good HUMAN,", 120, 420);
           ctx.fillText("but this cycle ends here!", 120, 450);
           
           ctx.fillStyle = '#ff0'; ctx.font = '12px "Press Start 2P", monospace';
           ctx.fillText("PRESS ENTER TO FIGHT", 300, 550);
       }
       
       if (gameState === 'VICTORY_CINEMATIC') {
            if (!window.victoryImg) { window.victoryImg = new Image(); window.victoryImg.src = 'assets/victory_bg.png'; }
            if (window.victoryImg.complete) ctx.drawImage(window.victoryImg, 0, 0, canvas.width, canvas.height);
            
            // Dark overlay panel for score breakdown
            let panelX = canvas.width/2 - 300;
            let panelY = 30;
            let panelW = 600;
            let panelH = 440;
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 2;
            ctx.strokeRect(panelX, panelY, panelW, panelH);
            
            // Title
            ctx.textAlign = 'center';
            ctx.fillStyle = '#0f0'; ctx.font = '22px "Press Start 2P", monospace';
            ctx.fillText("MISSION ACCOMPLISHED!", canvas.width/2, panelY + 40);
            
            // Score breakdown
            let sb = window.scoreBreakdown || {};
            let lineY = panelY + 80;
            let lineH = 32;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            let labelX = panelX + 30;
            let valueX = panelX + panelW - 30;
            
            function drawScoreLine(label, value, color) {
                ctx.fillStyle = color || '#ccc';
                ctx.textAlign = 'left';
                ctx.fillText(label, labelX, lineY);
                ctx.textAlign = 'right';
                ctx.fillText(String(value).padStart(9, ' '), valueX, lineY);
                lineY += lineH;
            }
            
            // Time display
            let mins = Math.floor((sb.elapsedSeconds || 0) / 60);
            let secs = (sb.elapsedSeconds || 0) % 60;
            ctx.fillStyle = '#888'; ctx.textAlign = 'center';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText('TIME: ' + mins + 'm ' + secs + 's  |  TRIVIA: ' + (sb.triviaCorrect||0) + '/' + (sb.triviaTotal||0), canvas.width/2, lineY);
            lineY += lineH + 5;
            
            ctx.font = '12px "Press Start 2P", monospace';
            drawScoreLine("BASE SCORE", (sb.baseScore||0).toLocaleString(), '#fff');
            drawScoreLine("SPEED BONUS", '+' + (sb.speedBonus||0).toLocaleString(), '#00ffff');
            drawScoreLine("HEALTH BONUS", '+' + (sb.healthBonus||0).toLocaleString(), '#00ff00');
            drawScoreLine("LIVES BONUS", '+' + (sb.livesBonus||0).toLocaleString(), '#ffcc00');
            drawScoreLine("TRIVIA BONUS", '+' + (sb.triviaBonus||0).toLocaleString(), '#ff66ff');
            if (sb.perfectTrivia > 0) {
                drawScoreLine("PERFECT TRIVIA!", '+' + sb.perfectTrivia.toLocaleString(), '#ff0');
            }
            
            // Divider line
            lineY += 5;
            ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(labelX, lineY); ctx.lineTo(valueX, lineY); ctx.stroke();
            lineY += lineH;
            
            // Final score
            ctx.font = '16px "Press Start 2P", monospace';
            ctx.fillStyle = '#0f0';
            ctx.textAlign = 'left';
            ctx.fillText("FINAL SCORE", labelX, lineY);
            ctx.textAlign = 'right';
            ctx.fillText(String(sb.finalScore||0).toLocaleString(), valueX, lineY);
            
            ctx.textAlign = 'left';
        }

       if (ship.health > 0 && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC' && gameState !== 'TRAITOR_DIALOGUE') {
         if (gameState === 'LEVEL_3') {
            // Orbital Slingshot Physics
            let ax = 0, ay = 0;
            for(let e of entities) {
               if (e.type === 'planet') {
                  let dx = e.x - ship.x; let dy = e.y - ship.y;
                  let distSq = dx*dx + dy*dy;
                  let f = e.m / Math.max(100, distSq);
                  ax += f * (dx / Math.sqrt(distSq));
                  ay += f * (dy / Math.sqrt(distSq));
                  if (Math.hypot(dx, dy) < e.r + ship.size) {
                     if (ship.health > 0) handleDeath();
                  }
               }
            }
            if (keys['ArrowLeft'] || keys['a']) ship.vx -= 150 * dt;
            if (keys['ArrowRight'] || keys['d']) ship.vx += 150 * dt;
            if (keys['ArrowUp'] || keys['w']) ship.vy -= 150 * dt;
            if (keys['ArrowDown'] || keys['s']) ship.vy += 150 * dt;
            
            ship.vx += ax * dt; ship.vy += ay * dt;
            ship.x += ship.vx * dt; ship.y += ship.vy * dt;

            if (ship.y < -50) {
               hudObjective.textContent = 'ESCAPED THE GRAVITY WELL! WARPING...';
               entities.length = 0; gameState = 'TRANSITION';
               setTimeout(() => triggerJumpscareAndQuiz(startLevel4), 2000);
            }
         } else if (gameState === 'LEVEL_4') {
            // Timer logic
            if (ship.health > 0 && ship.currentStarIndex < ship.constellationStars.length) {
               ship.levelTimer -= dt;
               hudObjective.textContent = `TIME REMAINING: ${Math.ceil(ship.levelTimer)}s`;
               if (ship.levelTimer <= 0) {
                  hudObjective.textContent = 'TIME IS UP!';
                  ship.health = 0;
                  handleDeath();
                  ship.levelTimer = 15;
                  ship.currentStarIndex = 0;
                  ship.trail = [];
               }
            }
            
            // Constellation
            let dx = 0, dy = 0;
            if (keys['ArrowUp'] || keys['w']) dy -= 1;
            if (keys['ArrowDown'] || keys['s']) dy += 1;
            if (keys['ArrowLeft'] || keys['a']) dx -= 1;
            if (keys['ArrowRight'] || keys['d']) dx += 1;
            const len = Math.hypot(dx, dy);
            if (len > 0) { dx /= len; dy /= len; }
            ship.x += dx * ship.speed * dt; ship.y += dy * ship.speed * dt;
            ship.trail.push({x: ship.x, y: ship.y});
            if (ship.trail.length > 50) ship.trail.shift();

            // Draw Trail
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; ctx.lineWidth = 4;
            ctx.beginPath();
            for (let i=0; i<ship.trail.length; i++) {
               if(i===0) ctx.moveTo(ship.trail[i].x, ship.trail[i].y);
               else ctx.lineTo(ship.trail[i].x, ship.trail[i].y);
            }
            ctx.stroke();

            // Draw Stars
            ctx.fillStyle = '#ffaa00';
            for (let i=0; i<ship.constellationStars.length; i++) {
               let st = ship.constellationStars[i];
               ctx.beginPath(); ctx.arc(st.x, st.y, 8, 0, Math.PI*2); ctx.fill();
               if (i < ship.currentStarIndex) {
                  if (i > 0) {
                     ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2;
                     ctx.beginPath(); ctx.moveTo(ship.constellationStars[i-1].x, ship.constellationStars[i-1].y);
                     ctx.lineTo(st.x, st.y); ctx.stroke();
                  }
               }
            }
            // Check star hit
            if (ship.currentStarIndex < ship.constellationStars.length) {
               let target = ship.constellationStars[ship.currentStarIndex];
               ctx.strokeStyle = '#00ff00'; ctx.beginPath(); ctx.arc(target.x, target.y, 15, 0, Math.PI*2); ctx.stroke();
               if (Math.hypot(ship.x - target.x, ship.y - target.y) < 20) {
                  ship.currentStarIndex++;
                  ship.score += 2500; updateHud();
                  if (ship.currentStarIndex >= ship.constellationStars.length) {
                     hudObjective.textContent = 'CONSTELLATION DRAWN! WARPING...';
                     gameState = 'TRANSITION';
                     setTimeout(() => triggerJumpscareAndQuiz(startLevel5), 2000);
                  }
               }
             }
             
             // Spawn tracking aliens to add challenge
             if (!ship.alienSpawnTimer) ship.alienSpawnTimer = 0;
             ship.alienSpawnTimer += dt;
             if (ship.alienSpawnTimer > 3.0) {
                ship.alienSpawnTimer = 0;
                entities.push({
                   type: 'alien',
                   x: Math.random() * canvas.width,
                   y: -20,
                   size: 15,
                   hp: 10,
                   speed: 100, // slightly slower tracking speed for balance
                   jitterX: Math.random() * 10,
                   jitterY: Math.random() * 10
                });
             }
         } else {
            // Normal movement
            let dx = 0, dy = 0;
            if (keys['ArrowUp'] || keys['w']) dy -= 1;
            if (keys['ArrowDown'] || keys['s']) dy += 1;
            if (keys['ArrowLeft'] || keys['a']) dx -= 1;
            if (keys['ArrowRight'] || keys['d']) dx += 1;
            const len = Math.hypot(dx, dy);
            if (len > 0) { dx /= len; dy /= len; }
            ship.x += dx * ship.speed * dt; ship.y += dy * ship.speed * dt;

            if (gameState === 'LEVEL_7') {
               let gx = canvas.width/2 - ship.x; let gy = canvas.height/2 - ship.y;
               let glen = Math.hypot(gx, gy);
               if (glen > 0) { ship.x += (gx/glen) * 50 * dt; ship.y += (gy/glen) * 50 * dt; }
            }
         }

         ship.x = Math.max(20, Math.min(canvas.width - 20, ship.x));
         if (gameState === 'LEVEL_3') {
            ship.y = Math.min(canvas.height - 20, ship.y);
         } else if (gameState === 'LEVEL_7') {
            // Draw epic alien scenery background
            if (!window.level7Bg) {
               window.level7Bg = new Image();
               window.level7Bg.src = 'assets/level7_bg.png';
            }
            if (window.level7Bg.complete) {
               ctx.drawImage(window.level7Bg, 0, 0, canvas.width, canvas.height);
            } else {
               // Fallback: deep purple cosmic field with pink stars
               ctx.fillStyle = '#0b001a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
               ctx.fillStyle = '#ff33cc';
               for(let i=0; i<30; i++) {
                  let sx = (Math.sin(i*123) * 1000 + 1000) % canvas.width;
                  let sy = ((Math.cos(i*321) * 1000) + timestamp*0.1) % canvas.height;
                  if (sy < 0) sy += canvas.height;
                  ctx.fillRect(sx, sy, 1, 1);
               }
            }

            // Spawn tracking alien minions during final boss fight
            if (!ship.minionTimer) ship.minionTimer = 0;
            ship.minionTimer += dt;
            if (ship.minionTimer > 4.0) {
               ship.minionTimer = 0;
               entities.push({ 
                  type: 'alien', 
                  x: Math.random() * canvas.width, 
                  y: -20, 
                  size: 15, 
                  hp: 10, 
                  speed: 120, // slightly slower than standard for dodgeability
                  jitterX: Math.random() * 10, 
                  jitterY: Math.random() * 10 
               });
            }
         } else {
            ship.y = Math.max(20, Math.min(canvas.height - 20, ship.y));
         }

          if (keys[' '] && shootCooldown <= 0 && gameState !== 'LEVEL_3') {
            playerLasers.push({ x: ship.x, y: ship.y - 15, size: 5, vx: 0 }); playSound('laser');
            if (ship.powerup === 'spread') {
               playerLasers.push({ x: ship.x, y: ship.y - 15, size: 5, vx: -200 });
               playerLasers.push({ x: ship.x, y: ship.y - 15, size: 5, vx: 200 });
            }
            shootCooldown = 0.2;
         }
         if (shootCooldown > 0) shootCooldown -= dt;

         drawShip(ship.x, ship.y);
       }

        // Lasers (Bright Aqua glowing lightsaber bullets)
        ctx.fillStyle = '#ffffff'; // White core
        ctx.shadowColor = '#00f6ff'; // Neon aqua glow
        ctx.shadowBlur = 8;
        for (let i = playerLasers.length - 1; i >= 0; i--) {
          let l = playerLasers[i];
          l.y -= 500 * dt; l.x += (l.vx || 0) * dt;
          ctx.fillRect(l.x - 2, l.y, 4, 15);
          if (l.y < 0) playerLasers.splice(i, 1);
        }
        ctx.shadowBlur = 0; // reset shadow glow

       for (let i = enemyLasers.length - 1; i >= 0; i--) {
         let l = enemyLasers[i];
         l.y += (l.vy !== undefined ? l.vy : 300) * dt;
         l.x += (l.vx || 0) * dt;
         
         if (l.type === 'saliva') {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.fillStyle = '#dfc300'; // Toxic yellow poop color
            
            // Draw a coiled pile of poop / splat saliva
            // Base tier
            ctx.beginPath();
            ctx.ellipse(0, 5, 12, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Middle tier
            ctx.beginPath();
            ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Top tier
            ctx.beginPath();
            ctx.ellipse(0, -4, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Pointy top curl
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.quadraticCurveTo(0, -11, 3, -9);
            ctx.quadraticCurveTo(1, -6, 0, -5);
            ctx.closePath();
            ctx.fill();
            
            // Toxic highlights (light yellow bubbles/slime dots)
            ctx.fillStyle = '#ffff33';
            ctx.beginPath();
            ctx.arc(-4, -1, 1.5, 0, Math.PI*2);
            ctx.arc(3, 4, 1, 0, Math.PI*2);
            ctx.fill();
            
            ctx.restore();
         } else {
            ctx.fillStyle = l.color || '#ff00ff';
            ctx.fillRect(l.x - 2, l.y, 4, 15);
         }
         
         if (!ship.isInvulnerable && Math.hypot(l.x - ship.x, l.y - ship.y) < ship.size) {
            ship.health -= 10; updateHud();
            createExplosion(ship.x, ship.y, '#ff0000', 10);
            enemyLasers.splice(i, 1);
            if (ship.health <= 0) { handleDeath(); }
         } else if (l.y > canvas.height) {
            enemyLasers.splice(i, 1);
         }
       }

       // Data Cube Spawner
       if (gameState === 'LEVEL_1' || gameState === 'LEVEL_2' || gameState === 'LEVEL_7') {
          if (Math.random() < 0.002 * dt * 60) {
             entities.push({ type: 'datacube', x: Math.random()*canvas.width, y: -20, size: 15 });
          }
       }

       // Entities
       for (let i = entities.length - 1; i >= 0; i--) {
         let e = entities[i];
         if (!e) continue;
         
         
         
         if (e.type === 'colored_rock') {
             e.y += e.vy * dt;
             ctx.fillStyle = e.color;
             ctx.beginPath();
             for(let j=0; j<8; j++){
                 let angle = (j/8) * Math.PI*2;
                 let rad = e.size * (0.8 + Math.random()*0.4);
                 ctx.lineTo(e.x + Math.cos(angle)*rad, e.y + Math.sin(angle)*rad);
             }
             ctx.fill();
             if (Math.random() < 0.3) {
                 particles.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*20, vy: -50, life: 1, maxLife: 1, color: 'rgba(200,200,200,0.5)', size: 3});
             }
             if (e.y > canvas.height + 50) entities.splice(i, 1);
             
             if (!ship.isInvulnerable && Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                 ship.health -= 20;
                 createExplosion(ship.x, ship.y, '#f00', 20);
                 entities.splice(i, 1);
             }
             continue;
         }

         if (e.type === 'energycore') {
             e.y += e.vy * dt;
             ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill();
             if (Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                 ship.coresCollected = (ship.coresCollected || 0) + 1;
                 createExplosion(e.x, e.y, '#ff0', 10);
                 entities.splice(i, 1);
                 ship.score += 1000; updateHud();
             } else if (e.y > canvas.height + 50) {
                 entities.splice(i, 1);
             }
             continue;
         }

         if (e.type === 'datacube') {
            e.y += 100 * dt;
            ctx.fillStyle = '#00ffff'; ctx.fillRect(e.x-10, e.y-10, 20, 20);
            ctx.fillStyle = '#000'; ctx.font='12px monospace'; ctx.fillText('?', e.x-4, e.y+4);
            let hit = false;
            for (let j = playerLasers.length - 1; j >= 0; j--) {
               if (Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                  playerLasers.splice(j, 1); hit = true; break;
               }
            }
            if (hit) {
               createExplosion(e.x, e.y, '#00ffff'); entities.splice(i, 1);
               triggerTriviaPowerup();
            } else if (e.y > canvas.height) { entities.splice(i, 1); }
         }
         else if (e.type === 'planet') {
            ctx.fillStyle = e.color; ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(e.x - e.r*0.2, e.y - e.r*0.2, e.r*0.8, 0, Math.PI*2); ctx.fill();

            // Draw orbiting moons
            if (e.moons) {
               for (let moon of e.moons) {
                  // Draw dashed orbit line
                  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                  ctx.lineWidth = 1.5;
                  ctx.setLineDash([4, 6]);
                  ctx.beginPath();
                  ctx.arc(e.x, e.y, moon.orbitR, 0, Math.PI*2);
                  ctx.stroke();
                  ctx.setLineDash([]); // reset line dash
                  
                  // Orbit math
                  let angle = moon.initialAngle + timestamp * moon.speed;
                  let mx = e.x + Math.cos(angle) * moon.orbitR;
                  let my = e.y + Math.sin(angle) * moon.orbitR;
                  
                  // Moon body
                  ctx.fillStyle = moon.color;
                  ctx.beginPath();
                  ctx.arc(mx, my, moon.moonR, 0, Math.PI*2);
                  ctx.fill();
                  
                  // Moon shadow detail
                  ctx.fillStyle = 'rgba(0,0,0,0.25)';
                  ctx.beginPath();
                  ctx.arc(mx - moon.moonR * 0.2, my - moon.moonR * 0.2, moon.moonR * 0.8, 0, Math.PI*2);
                  ctx.fill();
               }
            }
         }
         else if (e.type === 'alien') {
            let angle = Math.atan2(ship.y - e.y, ship.x - e.x);
            e.x += Math.cos(angle) * e.speed * dt + Math.sin(timestamp * 0.005 + (e.jitterX||0)) * 100 * dt;
            e.y += Math.sin(angle) * e.speed * dt + Math.cos(timestamp * 0.004 + (e.jitterY||0)) * 100 * dt;
            ctx.fillStyle = '#33ff33'; ctx.fillRect(e.x-15, e.y-10, 30, 20);
            ctx.fillStyle = '#000000'; ctx.fillRect(e.x-8, e.y-5, 4, 4); ctx.fillRect(e.x+4, e.y-5, 4, 4);
            if (Math.random() < 0.01 * dt * 60) enemyLasers.push({ x: e.x, y: e.y + 10 });
            
            // Contact damage with player ship
            if (!ship.isInvulnerable && Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + (e.size || 15)) {
                ship.health -= 15;
                updateHud();
                createExplosion(ship.x, ship.y, '#ff0000', 10);
                playSound('explosion');
                ship.isInvulnerable = true;
                ship.invulnerableTime = 1.5;
                if (ship.health <= 0) handleDeath();
            }

            for (let j = playerLasers.length - 1; j >= 0; j--) {
               if (Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                  playerLasers.splice(j, 1); e.hp -= 10;
                  if (e.hp <= 0) { createExplosion(e.x, e.y, '#33ff33'); ship.score += 10000; updateHud(); entities.splice(i, 1); }
                  break;
               }
            }
         }
         else if (e.type === 'asteroid') {
            e.y += e.vy * dt;
            ctx.fillStyle = '#888'; ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(e.x - e.size*0.3, e.y - e.size*0.3, e.size*0.2, 0, Math.PI*2); ctx.fill();
            
            if (!ship.isInvulnerable && Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
               ship.health -= 20; updateHud(); createExplosion(ship.x, ship.y, '#ff0000', 10);
               entities.splice(i, 1); if (ship.health <= 0) handleDeath();
               continue;
            }
            for (let j = playerLasers.length - 1; j >= 0; j--) {
               if (Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                  playerLasers.splice(j, 1); e.hp -= 10;
                  if (e.hp <= 0) {
                     createExplosion(e.x, e.y, '#aaa'); ship.score += 50000;
                     ship.asteroidsDestroyed = (ship.asteroidsDestroyed || 0) + 1; updateHud();
                     entities.splice(i, 1);
                     if (ship.asteroidsDestroyed >= 10 && gameState === 'LEVEL_2') {
                        hudObjective.textContent = 'PATH CLEARED! WARPING...';
                        entities.length = 0; gameState = 'TRANSITION';
                        setTimeout(() => triggerJumpscareAndQuiz(startLevel3), 2000);
                     }
                  }
                  break;
               }
            }
            if (e.y > canvas.height + 50 && entities[i]) entities.splice(i, 1);
         }
         else 
          if (e.type === 'traitor') {
              e.x += Math.sin(timestamp * 0.005) * 600 * dt;
              // draw red ship
              if (!window.traitorImg) { window.traitorImg = new Image(); window.traitorImg.src = 'assets/traitor_ship.png'; }
              if (window.traitorImg.complete) {
                  ctx.drawImage(window.traitorImg, e.x - e.size, e.y - e.size, e.size*2, e.size*2);
              }
              // health bar (dark background + red bar)
              ctx.fillStyle = '#333'; ctx.fillRect(e.x - 45, e.y - 55, 90, 6);
              ctx.fillStyle = '#f00'; ctx.fillRect(e.x - 45, e.y - 55, 90 * (e.hp/e.maxHp), 6);
              if (Math.random() < 0.15 * dt * 60) enemyLasers.push({x: e.x, y: e.y+20, vy: 400, color: '#f00'});
              
              // Contact damage with player ship
              if (!ship.isInvulnerable && Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                  ship.health -= 20; 
                  updateHud(); 
                  createExplosion(ship.x, ship.y, '#ff0000', 15);
                  playSound('explosion');
                  ship.isInvulnerable = true;
                  ship.invulnerableTime = 1.5;
                  if (ship.health <= 0) handleDeath();
              }
              
              for(let j=playerLasers.length-1; j>=0; j--){
                  if(Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                      e.hp -= 10; 
                      createExplosion(playerLasers[j].x, playerLasers[j].y, '#ff3333', 5);
                      playSound('laser');
                      playerLasers.splice(j,1);
                      if (e.hp <= 0) {
                          createExplosion(e.x, e.y, '#f00', 50); ship.score += 20000; updateHud();
                          entities.splice(i, 1); gameState = 'TRANSITION';
                          setTimeout(() => startBossDialogue(), 3000);
                      }
                      break;
                  }
              }
              continue;
          }

          if (e.type === 'boss') {
             // State machine initialization if not present
             if (!e.bossState) {
                e.bossState = 'idle';
                e.stateTimer = 2.0;
                e.chargeVx = 0;
                e.chargeVy = 0;
             }

             // Update state machine
             if (e.bossState === 'idle') {
                e.x += Math.sin(timestamp * 0.005) * 350 * dt; // hover left and right
                e.y += (150 - e.y) * 2 * dt; // return to height y=150
                e.stateTimer -= dt;
                if (e.stateTimer <= 0) {
                   if (Math.random() < 0.35) { // 35% chance to charge player
                      e.bossState = 'charge';
                      e.stateTimer = 1.0; // charge duration
                      let dx = ship.x - e.x;
                      let dy = ship.y - e.y;
                      let dist = Math.hypot(dx, dy);
                      if (dist > 0) {
                         // Charge speed: 600 px/sec
                         e.chargeVx = (dx / dist) * 600;
                         e.chargeVy = (dy / dist) * 600;
                      } else {
                         e.chargeVx = 0; e.chargeVy = 600;
                      }
                   } else {
                      e.stateTimer = Math.random() * 2 + 1; // wait 1-3 seconds
                   }
                }
             } else if (e.bossState === 'charge') {
                e.x += e.chargeVx * dt;
                e.y += e.chargeVy * dt;
                e.stateTimer -= dt;
                if (e.stateTimer <= 0) {
                   e.bossState = 'retreat';
                   e.stateTimer = 1.5; // retreat duration
                }
             } else if (e.bossState === 'retreat') {
                // Fly back up to top area smoothly
                e.x += (400 - e.x) * 2 * dt;
                e.y += (150 - e.y) * 3 * dt;
                e.stateTimer -= dt;
                if (e.stateTimer <= 0) {
                   e.bossState = 'idle';
                   e.stateTimer = Math.random() * 2 + 1;
                }
             }

             // Clamp boss coordinates to keep it inside screen
             e.x = Math.max(50, Math.min(canvas.width - 50, e.x));
             e.y = Math.max(50, Math.min(canvas.height - 100, e.y));

             drawBoss(e.x, e.y, e.hp, e.maxHp);
             if (Math.random() < 0.06 * dt * 60) {
                 enemyLasers.push({
                     type: 'saliva',
                     x: e.x + (Math.random() - 0.5) * 40,
                     y: e.y + 20,
                     vx: (Math.random() - 0.5) * 100,
                     vy: 250 + Math.random() * 150
                 });
                 playSound('laser');
             }
             
             // Contact damage with player ship
             if (!ship.isInvulnerable && Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                 ship.health -= 20;
                 updateHud();
                 createExplosion(ship.x, ship.y, '#ff0000', 15);
                 playSound('explosion');
                 ship.isInvulnerable = true;
                 ship.invulnerableTime = 1.5;
                 if (ship.health <= 0) handleDeath();
             }

             for (let j = playerLasers.length - 1; j >= 0; j--) {
                if (Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                   playerLasers.splice(j, 1); e.hp -= 2;
                   if (e.hp <= 0) {
                      createExplosion(e.x, e.y, '#ff00ff', 100); ship.score += 50000; updateHud();
                      entities.splice(i, 1); gameState = 'TRANSITION';
                      setTimeout(() => gameOver(true), 3000);
                   }
                   break;
                }
             }
          }
       }


       if (gameState === 'LEVEL_1' && !entities.some(e => e.type === 'alien')) {
         hudObjective.textContent = 'PLANET SECURED! WARPING...';
         gameState = 'TRANSITION';
         setTimeout(() => triggerJumpscareAndQuiz(startLevel2), 2000);
       }
       if (gameState === 'LEVEL_2') {
         let comet = entities.find(e => e.type === 'comet');
         if (comet) {
            // Draw tail
            ctx.save();
            let angle = Math.atan2(comet.vy, comet.vx);
            ctx.translate(comet.x, comet.y);
            ctx.rotate(angle);
            let gradient = ctx.createLinearGradient(0, 0, -400, 0);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, -comet.size);
            ctx.lineTo(-400, -150);
            ctx.lineTo(-400, 150);
            ctx.lineTo(0, comet.size);
            ctx.fill();
            ctx.restore();
            
            // Draw Comet Head
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI*2); ctx.fill();
            // Glow
            ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff';
            ctx.beginPath(); ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;
            
            // Move Comet and bounce
            comet.x += comet.vx * dt;
            comet.y += comet.vy * dt;
            if (comet.x < comet.size) { comet.x = comet.size; comet.vx = Math.abs(comet.vx); }
            else if (comet.x > canvas.width - comet.size) { comet.x = canvas.width - comet.size; comet.vx = -Math.abs(comet.vx); }
            
            if (comet.y < comet.size) { comet.y = comet.size; comet.vy = Math.abs(comet.vy); }
            else if (comet.y > canvas.height - comet.size) { comet.y = canvas.height - comet.size; comet.vy = -Math.abs(comet.vy); }

            // Check if ship is in tail
            let dx = ship.x - comet.x;
            let dy = ship.y - comet.y;
            let v_len = Math.hypot(comet.vx, comet.vy);
            let fx = comet.vx / v_len;
            let fy = comet.vy / v_len;
            let localX = dx * fx + dy * fy;
            let localY = dx * fy - dy * fx;
            let inTail = localX < 0 && localX > -400 && Math.abs(localY) < (comet.size + (Math.abs(localX) / 400) * (150 - comet.size));
            
            if (inTail) {
               ship.warpCharge += dt * 10; // 10% per second
               createExplosion(ship.x, ship.y + 10, '#0ff', 2);
            } else {
               ship.warpCharge -= dt * 2; // Drain slowly
            }
            ship.warpCharge = Math.max(0, Math.min(100, ship.warpCharge));
            
            // UI
            ctx.fillStyle = '#333'; ctx.fillRect(canvas.width/2 - 100, 80, 200, 20);
            ctx.fillStyle = '#0ff'; ctx.fillRect(canvas.width/2 - 100, 80, ship.warpCharge * 2, 20);
            
            if (ship.warpCharge >= 100) {
                hudObjective.textContent = 'WARP DRIVE CHARGED! WARPING...';
                gameState = 'TRANSITION';
                setTimeout(() => triggerJumpscareAndQuiz(startLevel3), 2000);
            } else {
                hudObjective.textContent = `STAY IN TAIL! CHARGE: ${Math.floor(ship.warpCharge)}%`;
            }
         }
       }
       
         if (gameState === 'LEVEL_6') {
             // Solar Wind Mechanics
             let windX = Math.sin(timestamp * 0.002) * 150;
             let windY = Math.cos(timestamp * 0.0015) * 100 + 50;
             ship.x += windX * dt;
             ship.y += windY * dt;
             
             ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
             for(let k=0; k<5; k++) {
                 ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 15, 3);
             }
             
             if (Math.random() < 0.05 * dt * 60) {
                 
                 const rockColors = ['#9b59b6', '#2ecc71', '#e67e22', '#3498db', '#e74c3c'];
                 entities.push({ type: 'colored_rock', x: Math.random()*canvas.width, y: -20, vy: 100 + Math.random()*200, size: 15 + Math.random()*20, color: rockColors[Math.floor(Math.random()*rockColors.length)] });

             }
             if (Math.random() < 0.015 * dt * 60) {
                 entities.push({ type: 'energycore', x: Math.random()*canvas.width, y: -20, vy: 50 + Math.random()*50, size: 10 });
             }
             
             hudObjective.textContent = `SLALOM! COLLECT ENERGY CORES: ${ship.coresCollected}/10`;
             
             if (ship.coresCollected >= 10) {
                 hudObjective.textContent = 'CORES COLLECTED! PREPARE...';
                 gameState = 'TRANSITION';
                 setTimeout(() => startTraitorDialogue(), 2000);
             }
         }

       if (gameState === 'LEVEL_5') {
         ship.survivalTimer -= dt;
         if (ship.survivalTimer <= 0) {
             hudObjective.textContent = 'YOU SURVIVED! WARPING...';
             gameState = 'TRANSITION';
             setTimeout(() => triggerJumpscareAndQuiz(startTraitorDialogue), 2000); // Transitions to Traitor Dialogue
         } else {
             hudObjective.textContent = `SURVIVE: ${Math.ceil(ship.survivalTimer)}s`;
             levelTimer += dt;
             if (levelTimer > 0.15) { // very fast spawn
                levelTimer = 0;
                let size = 10 + Math.random() * 40;
                let vy = 300 + Math.random() * 500;
                entities.push({ type: 'asteroid', x: Math.random() * canvas.width, y: -50, vy: vy, size: size, hp: size });
             }
         }
       }
       
       // Particles
       for (let i = particles.length - 1; i >= 0; i--) {
         let p = particles[i];
         p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
         if (p.life <= 0) particles.splice(i, 1);
         else { ctx.fillStyle = p.color; ctx.globalAlpha = p.life; ctx.fillRect(p.x, p.y, 4, 4); ctx.globalAlpha = 1.0; }
       }
    }
    
    requestAnimationFrame(gameLoop);
  }
}

  // About Modal Logic
  const aboutLink = document.getElementById('about-nav-link');
  const aboutModal = document.getElementById('about-modal');
  const closeAboutBtn = document.getElementById('close-about-btn');
  if (aboutLink && aboutModal && closeAboutBtn) {
     aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.classList.remove('hidden');
     });
     closeAboutBtn.addEventListener('click', () => {
        aboutModal.classList.add('hidden');
     });
  }

/* ============================================================
   12. BIG BANG & CMB SIMULATOR
   ============================================================ */
function initBigBangSimulator() {
  const canvas = document.getElementById('bigbang-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  setPixelMode(ctx);

  const btnSingularity = document.getElementById('btn-singularity');
  const btnExpansion = document.getElementById('btn-expansion');
  const btnCmb = document.getElementById('btn-cmb');
  const desc = document.getElementById('bigbang-desc');

  let state = 0; // 0 = Singularity, 1 = Expansion, 2 = CMB
  let frame = 0;
  let isVisible = false;
  let particles = [];
  
  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.1 });
  observer.observe(canvas);

  function setState(newState) {
    state = newState;
    particles = [];
    frame = 0;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    if (state === 0) {
      desc.innerHTML = "<strong>The Singularity:</strong> The universe begins as a hyper-dense, unimaginably hot cloud of energy. It is completely opaque\u2014light cannot escape!";
      for(let i=0; i<400; i++) {
        particles.push({
          x: cx + (Math.random()-0.5)*50,
          y: cy + (Math.random()-0.5)*50,
          color: Math.random() > 0.5 ? '#ffffff' : '#ffcc00',
          size: Math.random() > 0.5 ? 4 : 2
        });
      }
    } else if (state === 1) {
      desc.innerHTML = "<strong>Expansion & Cooling:</strong> The universe expands rapidly in all directions. As it expands, the matter cools down, and the first light is finally able to travel freely across space!";
      for(let i=0; i<300; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
          color: Math.random() > 0.5 ? '#ff5500' : '#ffffaa',
          size: Math.random() > 0.5 ? 4 : 2
        });
      }
    } else if (state === 2) {
      desc.innerHTML = "<strong>Cosmic Microwave Background (CMB):</strong> The ancient light from the Big Bang has stretched as the universe expanded, shifting into microwave radiation that we can still detect today as a faint, pixelated cosmic glow.";
      for(let i=0; i<10; i++) {
        particles.push({
          y: Math.random() * canvas.height,
          color: '#ffff00',
          amplitude: 10 + Math.random() * 20,
          speed: 0.05 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
    updateButtons();
  }

  function updateButtons() {
    btnSingularity.classList.toggle('active', state === 0);
    btnExpansion.classList.toggle('active', state === 1);
    btnCmb.classList.toggle('active', state === 2);
  }

  btnSingularity.addEventListener('click', () => setState(0));
  btnExpansion.addEventListener('click', () => setState(1));
  btnCmb.addEventListener('click', () => setState(2));

  setState(0);

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }
    frame++;
    
    // Background
    if (state === 0) {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    setPixelMode(ctx);
    
    if (state === 0) {
       // Singularity vibrating
       particles.forEach(p => {
         const px = p.x + (Math.random()-0.5)*12;
         const py = p.y + (Math.random()-0.5)*12;
         drawPixel(ctx, snap(px, 4), snap(py, 4), p.size, p.color);
       });
    } else if (state === 1) {
       // Expansion
       particles.forEach(p => {
         p.x += p.vx;
         p.y += p.vy;
         if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
           p.x = canvas.width/2;
           p.y = canvas.height/2;
         }
         drawPixel(ctx, snap(p.x, 4), snap(p.y, 4), p.size, p.color);
       });
    } else if (state === 2) {
       // CMB Stretching Spaghetti Light Beams
       // Wavelength goes from small to large (frequency goes from high to low)
       const stretchFactor = Math.min(1.0, frame * 0.002);
       const frequency = 0.1 - (stretchFactor * 0.09); 
       
       particles.forEach(p => {
         ctx.fillStyle = p.color;
         for (let x = 0; x < canvas.width; x += 4) {
           const wave = Math.sin(x * frequency + frame * p.speed + p.phase) * p.amplitude;
           ctx.fillRect(x, snap(p.y + wave, 4), 4, 4);
         }
       });
    }

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ===================== DISCOVER ALIEN LIFE FORM ===================== */
const exoplanetsData = {
  lava: {
    name: "Kepler-10b",
    img: "assets/exoplanet_lava.png",
    stats: "Type: Scorching Super-Earth<br>Temp: 1,500°C<br>Atmosphere: Vaporized Rock, Silicate clouds<br>Distance: 564 light-years",
    riddle: "This planet is so hot that rocks melt into oceans of lava. If extreme, heat-resistant life existed here, what element might form the sturdy backbone of its molecules instead of carbon?",
    options: [
      { text: "Silicon (SiO2)", correct: true, moleculeImg: "assets/molecule_sio2.png", moleculeName: "SILICON DIOXIDE" },
      { text: "Helium (He)", correct: false },
      { text: "Ammonia (NH3)", correct: false }
    ]
  },
  ice: {
    name: "Gliese 436 b",
    img: "assets/exoplanet_ice.png",
    stats: "Type: Ice Giant<br>Temp: -180°C<br>Atmosphere: Hydrogen, Helium, Methane<br>Distance: 31 light-years",
    riddle: "Water is rock-solid ice here. But another common compound can exist as a liquid at these extremely freezing temperatures. What could potentially act as a solvent for exotic cryogenic life?",
    options: [
      { text: "Liquid Methane (CH4)", correct: true, moleculeImg: "assets/molecule_ch4.png", moleculeName: "METHANE" },
      { text: "Liquid Iron (Fe)", correct: false },
      { text: "Liquid Nitrogen (N2)", correct: false }
    ]
  },
  earth: {
    name: "Proxima b",
    img: "assets/exoplanet_earth.png",
    stats: "Type: Terrestrial / Super-Earth<br>Temp: -39°C to 20°C<br>Atmosphere: Nitrogen, Oxygen (Unconfirmed)<br>Distance: 4.2 light-years",
    riddle: "Located right in the 'Habitable Zone' of its star, temperatures allow for the most famous universal solvent to exist in liquid form. What is it?",
    options: [
      { text: "Water (H2O)", correct: true, moleculeImg: "assets/molecule_h2o.png", moleculeName: "WATER" },
      { text: "Carbon Dioxide (CO2)", correct: false },
      { text: "Hydrogen Peroxide (H2O2)", correct: false }
    ]
  }
};

window.openAnalysisLab = function(planetId) {
  const data = exoplanetsData[planetId];
  if (!data) return;
  const modal = document.getElementById('analysis-lab-modal');
  modal.classList.remove('hidden');

  // Populate Telescope
  document.getElementById('lab-planet-img').src = data.img;
  document.getElementById('lab-planet-stats').innerHTML = data.stats;

  // Reset Microscope
  const noise = document.getElementById('microscope-noise');
  const molecule = document.getElementById('microscope-molecule');
  const nameLabel = document.getElementById('molecule-name');
  const scanLine = document.querySelector('.scan-line');

  noise.classList.remove('clear');
  molecule.classList.add('hidden');
  molecule.src = '';
  nameLabel.classList.add('hidden');
  nameLabel.innerText = '';
  scanLine.classList.remove('active');

  // Populate Puzzle
  document.getElementById('lab-puzzle-text').innerHTML = data.riddle;
  
  const optionsGrid = document.getElementById('lab-puzzle-options');
  optionsGrid.innerHTML = '';
  
  // Shuffle options
  const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);

  shuffledOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'pixel-btn puzzle-btn';
    btn.innerHTML = opt.text;
    btn.onclick = () => checkPuzzleAnswer(btn, opt);
    optionsGrid.appendChild(btn);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const closeLabBtn = document.getElementById('close-lab-btn');
  if (closeLabBtn) {
    closeLabBtn.addEventListener('click', () => {
      const m = document.getElementById('analysis-lab-modal');
      m.classList.add('hidden');
    });
  }
});

window.checkPuzzleAnswer = function(btn, optionData) {
  // Disable all buttons
  const btns = document.querySelectorAll('.puzzle-btn');
  btns.forEach(b => b.style.pointerEvents = 'none');

  if (optionData.correct) {
    btn.classList.add('correct');
    
    // Activate microscope
    const noise = document.getElementById('microscope-noise');
    const molecule = document.getElementById('microscope-molecule');
    const nameLabel = document.getElementById('molecule-name');
    const scanLine = document.querySelector('.scan-line');

    scanLine.classList.add('active');

    setTimeout(() => {
      noise.classList.add('clear');
      setTimeout(() => {
        molecule.src = optionData.moleculeImg;
        molecule.classList.remove('hidden');
        nameLabel.innerText = optionData.moleculeName;
        nameLabel.classList.remove('hidden');
        scanLine.classList.remove('active');
      }, 1000);
    }, 500);

  } else {
    btn.classList.add('incorrect');
    setTimeout(() => {
      btn.classList.remove('incorrect');
      btns.forEach(b => b.style.pointerEvents = 'auto');
    }, 500);
  }
};

/* ===================== DISCOVER ALIEN LIFE FORM CANVAS ===================== */
function initExoplanetSimulation() {
  const canvas = document.getElementById('exoplanets-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const tooltip = document.getElementById('exoplanet-tooltip');

  let time = 0;
  let mouseX = -100;
  let mouseY = -100;

  // Star systems mapping
  const systems = [
    {
      id: 'lava',
      starX: 150,
      starY: 200,
      starRadius: 25,
      starColor: '#ffaa44', // Sun-like
      starType: 'Sun-like Star',
      planetImgSrc: 'assets/exoplanet_lava.png',
      orbitRadius: 70,
      orbitSpeed: 0.02,
      planetSize: 45,
      label: 'Kepler-10b'
    },
    {
      id: 'earth',
      starX: 400,
      starY: 200,
      starRadius: 15,
      starColor: '#ff4444', // Red Dwarf
      starType: 'Red Dwarf',
      planetImgSrc: 'assets/exoplanet_earth.png',
      orbitRadius: 90,
      orbitSpeed: 0.015,
      planetSize: 35,
      label: 'Proxima b'
    },
    {
      id: 'ice',
      starX: 650,
      starY: 200,
      starRadius: 20,
      starColor: '#44aaff', // Blue dwarf
      starType: 'Blue Dwarf',
      planetImgSrc: 'assets/exoplanet_ice.png',
      orbitRadius: 110,
      orbitSpeed: 0.01,
      planetSize: 50,
      label: 'Gliese 436 b'
    }
  ];

  // Load images
  systems.forEach(sys => {
    sys.img = new Image();
    sys.img.src = sys.planetImgSrc;
  });

  // Observe intersection for animation pause/resume
  let isVisible = false;
  const observer = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  });
  observer.observe(canvas);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Calculate scale correctly if CSS scales the canvas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
    
    // Store raw mouse position for tooltip (relative to container)
    sysMouseX = e.clientX - rect.left;
    sysMouseY = e.clientY - rect.top;
  });
  
  let sysMouseX = -100;
  let sysMouseY = -100;

  canvas.addEventListener('mouseleave', () => {
    mouseX = -100;
    mouseY = -100;
    tooltip.classList.add('hidden');
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('click', () => {
    for (const sys of systems) {
      if (sys.isHovered) {
        window.openAnalysisLab(sys.id);
        break;
      }
    }
  });

  function draw() {
    if (!isVisible) { requestAnimationFrame(draw); return; }
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pixel mode
    setPixelMode(ctx);
    
    let anyHovered = false;
    let tooltipSys = null;

    for (const sys of systems) {
      // Draw orbit line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.arc(sys.starX, sys.starY, sys.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw Star
      drawPixel(ctx, snap(sys.starX, 4), snap(sys.starY, 4), sys.starRadius * 2, sys.starColor);
      
      // Star slight glow/flicker
      if (Math.random() > 0.9) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(sys.starX - sys.starRadius*1.5, sys.starY - sys.starRadius*1.5, sys.starRadius*3, sys.starRadius*3);
      }
      
      // Calculate Planet Pos
      const angle = time * sys.orbitSpeed;
      const px = sys.starX + Math.cos(angle) * sys.orbitRadius;
      const py = sys.starY + Math.sin(angle) * sys.orbitRadius;
      
      // Draw Planet
      if (sys.img.complete) {
        ctx.drawImage(sys.img, px - sys.planetSize/2, py - sys.planetSize/2, sys.planetSize, sys.planetSize);
      } else {
        drawPixel(ctx, snap(px, 4), snap(py, 4), sys.planetSize, '#fff');
      }
      
      // Hit detection
      const dist = Math.hypot(mouseX - px, mouseY - py);
      if (dist < sys.planetSize * 0.8) {
        sys.isHovered = true;
        anyHovered = true;
        tooltipSys = sys;
      } else {
        sys.isHovered = false;
      }
    }
    
    if (anyHovered) {
      canvas.style.cursor = 'pointer';
      // Update tooltip
      tooltip.innerText = tooltipSys.label + " (Click to Analyze)";
      tooltip.style.left = (sysMouseX + 15) + 'px';
      tooltip.style.top = (sysMouseY + 15) + 'px';
      tooltip.classList.remove('hidden');
      tooltip.style.display = 'block'; // force display
    } else {
      canvas.style.cursor = 'default';
      tooltip.classList.add('hidden');
      tooltip.style.display = 'none';
    }

    time++;
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
