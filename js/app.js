// Main Orchestrator and Controller
import { Starfield } from './canvas-bg.js';
import { StarFormationSim } from './star-formation.js';
import { PlanetFormationSim } from './planet-formation.js';
import { AstrobiologyLab } from './astrobiology.js';
import { OrbitSandbox } from './orbit-sim.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Background Starfield
    const starfield = new Starfield('starfield-canvas');

    // 2. Initialize Simulators
    const starSim = new StarFormationSim('star-formation-canvas');
    const planetSim = new PlanetFormationSim('planet-formation-canvas');
    const astrobiology = new AstrobiologyLab('astrobiology-canvas');
    const orbitSandbox = new OrbitSandbox('orbit-canvas');

    // 3. Page Section Intersection Observer (Performance Optimization)
    // Canvas animations only run when they are visible in the user's viewport
    const options = { threshold: 0.1 };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            const isVisible = entry.isIntersecting;

            if (id === 'formation-lab') {
                const isStarActive = document.getElementById('lab-star-content').classList.contains('active');
                if (isVisible) {
                    if (isStarActive) {
                        starSim.startAnimation();
                    } else {
                        planetSim.startAnimation();
                    }
                } else {
                    starSim.stopAnimation();
                    planetSim.stopAnimation();
                }
            } 
            else if (id === 'exoplanets') {
                if (isVisible) {
                    astrobiology.startAnimation();
                } else {
                    astrobiology.stopAnimation();
                }
            } 
            else if (id === 'orbit-playground') {
                if (isVisible) {
                    orbitSandbox.startAnimation();
                } else {
                    orbitSandbox.stopAnimation();
                }
            }
        });
    }, options);

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });

    // 4. Header Navbar Scrolling and Active Highlights
    const navLinks = document.querySelectorAll('.nav-item');
    const scrollSections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let current = '';
        scrollSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 5. Encyclopedia Tab Switches
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            const targetPanel = btn.id.replace('tab-', 'panel-');
            document.getElementById(targetPanel).classList.add('active');
        });
    });

    // 6. Formation Lab Switchers (Star vs Planet)
    const labStarBtn = document.getElementById('lab-star-btn');
    const labPlanetBtn = document.getElementById('lab-planet-btn');
    const labStarContent = document.getElementById('lab-star-content');
    const labPlanetContent = document.getElementById('lab-planet-content');

    labStarBtn.addEventListener('click', () => {
        labStarBtn.classList.add('active');
        labPlanetBtn.classList.remove('active');
        labStarContent.classList.add('active');
        labPlanetContent.classList.remove('active');

        // Toggle animations to save CPU cycles
        planetSim.stopAnimation();
        starSim.startAnimation();
    });

    labPlanetBtn.addEventListener('click', () => {
        labPlanetBtn.classList.add('active');
        labStarBtn.classList.remove('active');
        labPlanetContent.classList.add('active');
        labStarContent.classList.remove('active');

        // Toggle animations to save CPU cycles
        starSim.stopAnimation();
        planetSim.startAnimation();
    });

    // Simulation Trigger Buttons
    document.getElementById('star-trigger-btn').addEventListener('click', () => {
        starSim.triggerCollapse();
    });

    document.getElementById('star-reset-btn').addEventListener('click', () => {
        starSim.resetCloud();
    });

    document.getElementById('planet-trigger-btn').addEventListener('click', () => {
        planetSim.triggerAccretion();
    });

    document.getElementById('planet-reset-btn').addEventListener('click', () => {
        planetSim.resetDisk();
    });

    // 7. Astrobiology Exoplanet Specimen Selector
    const exoplanetCards = document.querySelectorAll('.exoplanet-card');
    exoplanetCards.forEach(card => {
        card.addEventListener('click', () => {
            exoplanetCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const biome = card.dataset.biome;
            astrobiology.setBiome(biome);
        });
    });

    // 8. Cross-Section Jump Links & Quick Launches
    // "Simulate Star Formation" link in Star Encyclopedia card
    document.getElementById('go-to-star-form').addEventListener('click', (e) => {
        e.preventDefault();
        labStarBtn.click();
        document.getElementById('formation-lab').scrollIntoView({ behavior: 'smooth' });
    });

    // "Simulate Accretion" link in Planet Encyclopedia card
    document.getElementById('go-to-planet-form').addEventListener('click', (e) => {
        e.preventDefault();
        labPlanetBtn.click();
        document.getElementById('formation-lab').scrollIntoView({ behavior: 'smooth' });
    });

    // "Simulate Atmospheric Entry" from Meteoroid tab to Sandbox
    document.getElementById('trigger-play-meteor').addEventListener('click', () => {
        document.getElementById('orbit-playground').scrollIntoView({ behavior: 'smooth' });
        // Let it scroll first then launch
        setTimeout(() => {
            orbitSandbox.launchMeteoroid();
        }, 800);
    });
});
