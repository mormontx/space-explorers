// Speculative Astrobiology Specimen Drawer
export class AstrobiologyLab {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.currentBiome = 'super-earth';
        this.isAnimating = false;
        this.time = 0;

        // Biome data cards
        this.specimenData = {
            'super-earth': {
                name: 'Giga-Tardigrade (Baro-crawler)',
                description: 'A low-profile, multi-legged organism with a heavy silicon-reinforced exoskeleton. Lacking vertical limbs to prevent falling injuries under 3.2g gravity, it crawls close to the floor utilizing high-pressure hydraulic muscles.',
                adaptations: [
                    'Skeletal carbon-silicon composite plating for crushing pressure.',
                    'Hyper-low center of mass to resist heavy shear winds.',
                    'Iron-sulfur metabolic pathways that thrives on dense basalt plains.'
                ]
            },
            'ocean-world': {
                name: 'Cryo-Swarmer (Hydro-Kraken)',
                description: 'Living in global seas insulated by a 15km thick ice sheet, this cephalopod-like creature utilizes bioluminescence for communication and chemosynthetic whiskers to capture minerals floating from deep hydro-thermal vents.',
                adaptations: [
                    'Pulsating water-jet siphon that prevents ice crystals from forming.',
                    'Luciferin-based photophores that blink to navigate in perpetual darkness.',
                    'Antifreeze glycoproteins in blood to tolerate sub-zero oceans.'
                ]
            },
            'locked-desert': {
                name: 'Twilight Strider (Strix-Regulator)',
                description: 'Occupying the narrow twilight band (terminator zone) between scorching heat and freezing dark, this strider has asymmetrical thermoregulatory plates to radiate heat from one side and capture it on the other.',
                adaptations: [
                    'Spindly carbon-fiber legs with minimal ground footprint on scalding sands.',
                    'Bimetallic heat-pipe scales that funnel body temperature.',
                    'Infrared radar eyes that scan for twilight dust storms.'
                ]
            },
            'gas-giant': {
                name: 'Aero-Plankter (Zeppelin Whale)',
                description: 'A massive floating organism that populates the warm middle cloud layers of Jovian giants. It is filled with hot hydrogen gas, acting as a living hot air balloon. It filters organic compounds from winds.',
                adaptations: [
                    'Permeable skin membranes that synthesize atmospheric helium.',
                    'Feathery chemical-harvester sails that gather nitrogen particles.',
                    'Electro-static stingers that absorb lightning charges for energy.'
                ]
            }
        };

        // DOM elements
        this.nameEl = document.getElementById('specimen-name');
        this.descEl = document.getElementById('specimen-description');
        this.adaptEl = document.getElementById('specimen-adaptations');

        this.init();
    }

    init() {
        this.resize();
        this.setBiome('super-earth');
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 500;
        this.canvas.height = rect.height || 250;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    setBiome(biomeId) {
        if (!this.specimenData[biomeId]) return;
        this.currentBiome = biomeId;
        
        // Update DOM text contents
        const data = this.specimenData[biomeId];
        if (this.nameEl) this.nameEl.innerText = data.name;
        if (this.descEl) this.descEl.innerText = data.description;
        
        if (this.adaptEl) {
            this.adaptEl.innerHTML = '';
            data.adaptations.forEach(adapt => {
                const li = document.createElement('li');
                li.innerText = adapt;
                this.adaptEl.appendChild(li);
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.05;

        // Draw biome background effects
        this.drawBiomeBg();

        // Draw creature based on biome
        this.ctx.save();
        switch (this.currentBiome) {
            case 'super-earth':
                this.drawGigaTardigrade();
                break;
            case 'ocean-world':
                this.drawHydroSwarmer();
                break;
            case 'locked-desert':
                this.drawTwilightStrider();
                break;
            case 'gas-giant':
                this.drawZeppelinWhale();
                break;
        }
        this.ctx.restore();
    }

    drawBiomeBg() {
        // Subtle ambient atmospheric background colors
        let gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        if (this.currentBiome === 'super-earth') {
            gradient.addColorStop(0, 'rgba(102, 51, 153, 0.15)'); // Heavy purple atmosphere
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        } else if (this.currentBiome === 'ocean-world') {
            gradient.addColorStop(0, 'rgba(14, 165, 233, 0.2)'); // Deep water cyan
            gradient.addColorStop(1, 'rgba(2, 6, 23, 0.8)');
        } else if (this.currentBiome === 'locked-desert') {
            gradient.addColorStop(0, 'rgba(217, 119, 6, 0.15)'); // Amber twilight sun rays
            gradient.addColorStop(1, 'rgba(2, 6, 23, 0.7)');
        } else if (this.currentBiome === 'gas-giant') {
            gradient.addColorStop(0, 'rgba(165, 180, 252, 0.15)'); // Gas giant storms
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw environmental micro-particles
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = 0; i < 15; i++) {
            const seed = i * 23.45;
            const size = Math.abs(Math.sin(seed)) * 2;
            let x = (Math.abs(Math.cos(seed)) * this.canvas.width + this.time * (0.2 + size * 0.2)) % this.canvas.width;
            let y = (Math.abs(Math.sin(seed * 2)) * this.canvas.height + Math.sin(this.time * 0.05 + seed) * 10) % this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Creature 1: Super Earth Crawler
    drawGigaTardigrade() {
        const x = this.centerX;
        const y = this.centerY + 20 + Math.sin(this.time) * 1.5; // low bounce
        
        // Exoskeleton body plates (horizontal, overlapping)
        this.ctx.fillStyle = 'rgba(120, 113, 108, 0.85)';
        this.ctx.strokeStyle = 'rgba(190, 24, 74, 0.6)'; // red joint lines
        this.ctx.lineWidth = 2;

        // Draw legs moving procedurally
        for (let i = 0; i < 6; i++) {
            const legX = x - 50 + i * 20;
            const legOffset = i * (Math.PI / 3);
            const legAngle = Math.sin(this.time * 1.5 + legOffset) * 0.3;

            this.ctx.save();
            this.ctx.translate(legX, y + 10);
            this.ctx.rotate(legAngle);
            
            // Draw thick leg segment
            this.ctx.fillStyle = 'rgba(68, 64, 60, 0.9)';
            this.ctx.fillRect(-6, 0, 12, 16);
            
            // Draw hydraulic claw
            this.ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
            this.ctx.beginPath();
            this.ctx.moveTo(-4, 16);
            this.ctx.lineTo(4, 16);
            this.ctx.lineTo(0, 22);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw main segments
        this.ctx.fillStyle = 'rgba(87, 83, 78, 0.95)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 70, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Segment plates
        this.ctx.strokeStyle = 'rgba(168, 162, 158, 0.2)';
        for (let i = -2; i <= 2; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * 20, y - 20);
            this.ctx.lineTo(x + i * 20, y + 20);
            this.ctx.stroke();
        }

        // Eye glow
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.95)'; // bright red eye sensors
        this.ctx.beginPath();
        this.ctx.arc(x - 55, y - 4, 3, 0, Math.PI * 2);
        this.ctx.arc(x - 52, y + 2, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Creature 2: Sub-glacial Cephalopod
    drawHydroSwarmer() {
        const x = this.centerX;
        const y = this.centerY - 20 + Math.sin(this.time * 0.8) * 12; // Floating bobbing

        // Bioluminescent tentacles waving like sine waves
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        this.ctx.lineWidth = 3.5;

        const numTentacles = 5;
        for (let i = 0; i < numTentacles; i++) {
            const offset = (i - 2) * 12;
            const speedFact = 1 + i * 0.1;
            this.ctx.beginPath();
            this.ctx.moveTo(x + offset, y + 10);
            
            // Bezier-like curve drawing using sine waves
            for (let ty = 10; ty < 100; ty += 10) {
                const wave = Math.sin(this.time * 1.5 + ty * 0.05 + i) * (15 + ty * 0.1);
                this.ctx.lineTo(x + offset + wave, y + ty);
            }
            this.ctx.stroke();
        }

        // Bioluminescent glowing bulbous head
        const headGlow = this.ctx.createRadialGradient(x, y - 10, 0, x, y - 10, 45);
        headGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        headGlow.addColorStop(0.3, 'rgba(56, 189, 248, 0.85)'); // Cyan glow
        headGlow.addColorStop(0.7, 'rgba(102, 51, 153, 0.45)');
        headGlow.addColorStop(1, 'transparent');

        this.ctx.fillStyle = headGlow;
        this.ctx.beginPath();
        this.ctx.arc(x, y - 10, 45, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner core of the head
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 10, 16, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Glowing dots
        this.ctx.fillStyle = 'rgba(253, 224, 71, 0.95)'; // yellow light dots
        for (let i = 0; i < 4; i++) {
            const dotAngle = this.time * 0.2 + (Math.PI / 2) * i;
            this.ctx.beginPath();
            this.ctx.arc(x + Math.cos(dotAngle) * 20, y - 10 + Math.sin(dotAngle) * 20, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // Creature 3: Twilight Strider
    drawTwilightStrider() {
        const x = this.centerX;
        const y = this.centerY + 5;
        
        // Ground lines
        this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 100, y + 60);
        this.ctx.lineTo(x + 100, y + 60);
        this.ctx.stroke();

        // Draw Spindly jointed legs
        this.ctx.strokeStyle = 'rgba(75, 85, 99, 0.9)';
        this.ctx.lineWidth = 3;

        for (let i = 0; i < 2; i++) {
            const dir = i === 0 ? -1 : 1;
            const legOffset = this.time * 1.8 + i * Math.PI;
            const stepY = Math.abs(Math.sin(legOffset)) * 18;
            const stepX = Math.cos(legOffset) * 25;

            // Joint coordinates
            const footX = x + dir * 45 + stepX;
            const footY = y + 60 - stepY;
            const kneeX = x + dir * 60;
            const kneeY = y + 5;

            this.ctx.beginPath();
            this.ctx.moveTo(x + dir * 10, y + 10);
            this.ctx.lineTo(kneeX, kneeY);
            this.ctx.lineTo(footX, footY);
            this.ctx.stroke();

            // Foot contact point glow
            this.ctx.fillStyle = 'rgba(217, 119, 6, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(footX, footY, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Strider Body
        this.ctx.fillStyle = 'rgba(31, 41, 55, 0.95)';
        this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 18, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Thermal shielding plates (curved fan on top)
        this.ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 10, 22, -Math.PI * 0.7, -Math.PI * 0.1);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        this.ctx.fill();
        this.ctx.stroke();

        // Sensor Eye (scanning back and forth)
        const eyeSweep = Math.sin(this.time * 1.5) * 12;
        this.ctx.fillStyle = 'rgba(217, 119, 6, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(x + eyeSweep, y + 5, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Creature 4: Gas Giant Zeppelin Whale
    drawZeppelinWhale() {
        const x = this.centerX;
        const y = this.centerY + Math.sin(this.time * 0.6) * 10; // slow float
        
        // Feathery filter wings waving slowly
        this.ctx.fillStyle = 'rgba(165, 180, 252, 0.35)';
        this.ctx.strokeStyle = 'rgba(165, 180, 252, 0.7)';
        this.ctx.lineWidth = 1.5;

        // Draw top sail
        this.ctx.save();
        this.ctx.translate(x - 20, y - 20);
        this.ctx.rotate(Math.sin(this.time) * 0.15 - 0.2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-15, -45, -45, -55);
        this.ctx.quadraticCurveTo(-10, -30, 0, 0);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        // Draw bottom sail
        this.ctx.save();
        this.ctx.translate(x - 20, y + 20);
        this.ctx.rotate(-Math.sin(this.time) * 0.15 + 0.2);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.quadraticCurveTo(-15, 45, -45, 55);
        this.ctx.quadraticCurveTo(-10, 30, 0, 0);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();

        // Main gas bladder body (zeppelin-like)
        const mainGrad = this.ctx.createLinearGradient(x - 70, 0, x + 70, 0);
        mainGrad.addColorStop(0, 'rgba(79, 70, 229, 0.85)');   // Dark indigo front
        mainGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.8)'); // Light blue middle
        mainGrad.addColorStop(1, 'rgba(129, 140, 248, 0.6)');   // Glowing back gas release

        this.ctx.fillStyle = mainGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 75, 30, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Longitudinal structural bands
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 75, 12, 0, 0, Math.PI * 2);
        this.ctx.stroke();

        // Gas discharge rings pulsating from back
        const gasRadius = 15 + (this.time * 8) % 30;
        const gasAlpha = 1 - (gasRadius - 15) / 30;
        this.ctx.strokeStyle = `rgba(165, 180, 252, ${gasAlpha * 0.4})`;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(x + 85 + (gasRadius * 0.2), y, gasRadius * 0.6, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const tick = () => {
            if (!this.isAnimating) return;
            this.draw();
            requestAnimationFrame(tick);
        };
        tick();
    }

    stopAnimation() {
        this.isAnimating = false;
    }
}
