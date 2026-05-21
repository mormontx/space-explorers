// Orbit Sandbox & Trajectory Simulator
export class OrbitSandbox {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.speedMultiplier = 1.0;
        this.isAnimating = false;
        this.time = 0;

        // Simulator objects
        this.planet = { radius: 190, angle: 0, speed: 0.004, size: 10, atmosRadius: 28 };
        this.comet = { a: 170, b: 60, centerX: -30, angle: 0, speed: 0.012, size: 4 };
        this.asteroids = [];
        this.meteors = [];
        this.meteorites = []; // Landed impact remnants on the planet
        this.explosions = [];

        // DOM elements
        this.speedValEl = document.getElementById('speed-val');
        this.speedSlider = document.getElementById('speed-slider');
        this.launchBtn = document.getElementById('btn-launch-meteor');
        this.resetBtn = document.getElementById('btn-reset-sandbox');
        this.logContainer = document.getElementById('event-log-container');

        this.init();
    }

    init() {
        this.resize();
        this.generateAsteroidBelt();
        
        window.addEventListener('resize', () => this.resize());
        
        if (this.speedSlider) {
            this.speedSlider.addEventListener('input', (e) => {
                this.speedMultiplier = parseFloat(e.target.value);
                if (this.speedValEl) this.speedValEl.innerText = this.speedMultiplier.toFixed(1);
            });
        }

        if (this.launchBtn) {
            this.launchBtn.addEventListener('click', () => this.launchMeteoroid());
        }

        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetSandbox());
        }
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 600;
        this.canvas.height = rect.height || 500;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    generateAsteroidBelt() {
        this.asteroids = [];
        const numAsteroids = 120;
        for (let i = 0; i < numAsteroids; i++) {
            // Belt orbit radius located between sun and planet
            const radius = Math.random() * 40 + 95;
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 0.002 + 0.003) * (70 / radius);
            this.asteroids.push({
                radius,
                angle,
                speed,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    launchMeteoroid() {
        // Spawn meteoroid at screen edge heading toward the planet's orbit
        const spawnSides = [
            { x: Math.random() * this.canvas.width, y: -20 },
            { x: -20, y: Math.random() * this.canvas.height },
            { x: this.canvas.width + 20, y: Math.random() * this.canvas.height }
        ];
        const spawn = spawnSides[Math.floor(Math.random() * spawnSides.length)];
        
        // Target: approximate position of the planet
        const px = this.centerX + Math.cos(this.planet.angle) * this.planet.radius;
        const py = this.centerY + Math.sin(this.planet.angle) * this.planet.radius;

        // Angle towards planet with a slight random spread
        const angleToPlanet = Math.atan2(py - spawn.y, px - spawn.x) + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 1.5 + 2.5;

        this.meteors.push({
            x: spawn.x,
            y: spawn.y,
            vx: Math.cos(angleToPlanet) * speed,
            vy: Math.sin(angleToPlanet) * speed,
            size: Math.random() * 3 + 2.5,
            state: 'meteoroid', // 'meteoroid', 'meteor' (burning), 'impacted'
            trail: []
        });

        this.logEvent('Meteoroid launched from interstellar space.', 'system-entry');
    }

    logEvent(text, cssClass = '') {
        if (!this.logContainer) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${cssClass}`;
        
        const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `[${timeStamp}] ${text}`;
        
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    resetSandbox() {
        this.meteors = [];
        this.meteorites = [];
        this.explosions = [];
        this.planet.angle = 0;
        this.comet.angle = 0;
        this.generateAsteroidBelt();
        
        if (this.logContainer) this.logContainer.innerHTML = '';
        this.logEvent('Sandbox reset. All trajectories cleared.', 'system-entry');
    }

    updatePhysics() {
        const dt = this.speedMultiplier;

        // Orbit Planet
        this.planet.angle += this.planet.speed * dt;

        // Orbit Comet (Elliptical orbit using parametric equation)
        // x = center + a*cos(theta), y = b*sin(theta)
        // Kepler's second law approximation: speed increases near perihelion (closer to star)
        this.comet.angle += this.comet.speed * dt * (1.8 - Math.cos(this.comet.angle));

        // Orbit Asteroids
        this.asteroids.forEach(ast => {
            ast.angle += ast.speed * dt;
        });

        // Current planet coordinate
        const px = this.centerX + Math.cos(this.planet.angle) * this.planet.radius;
        const py = this.centerY + Math.sin(this.planet.angle) * this.planet.radius;

        // Update Meteoroids / Meteors
        this.meteors = this.meteors.filter(m => {
            m.x += m.vx * dt;
            m.y += m.vy * dt;

            // Store trail points
            m.trail.push({ x: m.x, y: m.y });
            if (m.trail.length > 20) m.trail.shift();

            // Distance to planet center
            const dx = px - m.x;
            const dy = py - m.y;
            const distToPlanet = Math.sqrt(dx * dx + dy * dy);

            // 1. Check atmospheric entry (becomes a Meteor)
            if (m.state === 'meteoroid' && distToPlanet <= this.planet.atmosRadius) {
                m.state = 'meteor';
                m.vx *= 0.85; // Atmospheric friction slows it down
                m.vy *= 0.85;
                this.logEvent('Atmospheric Entry! Friction ignites meteoroid into a burning <strong>Meteor</strong>.', 'burn-entry');
            }

            // 2. Check collision impact (becomes Meteorite)
            if (distToPlanet <= this.planet.size + 2) {
                this.logEvent('IMPACT! The core survived atmospheric ablation and landed. It is now a <strong>Meteorite</strong>.', 'impact-entry');

                // Trigger explosion animation
                this.explosions.push({
                    x: m.x,
                    y: m.y,
                    radius: 2,
                    maxRadius: 25,
                    alpha: 1
                });

                // Attach meteorite to planet surface
                // Determine relative angle on planet to rotate with it
                const relativeAngle = Math.atan2(m.y - py, m.x - px) - this.planet.angle;
                this.meteorites.push({
                    relAngle: relativeAngle,
                    dist: this.planet.size - 1,
                    size: m.size * 0.4
                });

                return false; // Remove active meteor
            }

            // Boundary removal if it misses and flies out of screen
            if (m.x < -50 || m.x > this.canvas.width + 50 || m.y < -50 || m.y > this.canvas.height + 50) {
                this.logEvent('Meteoroid missed planet gravity and exited system.', 'system-entry');
                return false;
            }

            return true;
        });

        // Update Explosions
        this.explosions = this.explosions.filter(exp => {
            exp.radius += 1.5 * dt;
            exp.alpha -= 0.04 * dt;
            return exp.alpha > 0;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Central Star
        const starGrad = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 35
        );
        starGrad.addColorStop(0, '#ffffff');
        starGrad.addColorStop(0.2, 'rgba(253, 224, 71, 0.95)');
        starGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
        starGrad.addColorStop(1, 'transparent');

        this.ctx.fillStyle = starGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 35, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Draw Planet Orbit Line
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.planet.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // 3. Draw Asteroid Belt
        this.ctx.fillStyle = 'rgba(156, 163, 175, 0.45)';
        this.asteroids.forEach(ast => {
            const ax = this.centerX + Math.cos(ast.angle) * ast.radius;
            const ay = this.centerY + Math.sin(ast.angle) * ast.radius;
            this.ctx.beginPath();
            this.ctx.arc(ax, ay, ast.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 4. Draw Comet Elliptical Orbit & Comet
        // Ellipse center offset
        const cometCenterX = this.centerX + this.comet.centerX;
        const cometCenterY = this.centerY;
        
        // Orbit line
        this.ctx.strokeStyle = 'rgba(173, 216, 230, 0.06)';
        this.ctx.save();
        this.ctx.translate(cometCenterX, cometCenterY);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.comet.a, this.comet.b, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();

        // Calculate Comet coordinates
        const cx = cometCenterX + Math.cos(this.comet.angle) * this.comet.a;
        const cy = cometCenterY + Math.sin(this.comet.angle) * this.comet.b;

        // Comet Tail (Always points away from the Sun at center)
        const dx = cx - this.centerX;
        const dy = cy - this.centerY;
        const distToSun = Math.sqrt(dx * dx + dy * dy);
        
        // Tail length increases near the sun (thermal sublimation)
        const tailLength = Math.max(0, (230 - distToSun) * 0.45);
        if (tailLength > 5) {
            const tailAngle = Math.atan2(dy, dx); // Angle away from sun

            // Gas tail (cyan, straight)
            const gasGrad = this.ctx.createLinearGradient(
                cx, cy, 
                cx + Math.cos(tailAngle) * tailLength, cy + Math.sin(tailAngle) * tailLength
            );
            gasGrad.addColorStop(0, 'rgba(186, 230, 253, 0.75)'); // Light blue ice
            gasGrad.addColorStop(1, 'transparent');

            this.ctx.strokeStyle = gasGrad;
            this.ctx.lineWidth = this.comet.size * 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy);
            this.ctx.lineTo(cx + Math.cos(tailAngle) * tailLength, cy + Math.sin(tailAngle) * tailLength);
            this.ctx.stroke();
        }

        // Comet Head
        this.ctx.fillStyle = '#bae6fd';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, this.comet.size, 0, Math.PI * 2);
        this.ctx.fill();

        // 5. Draw Planet (with Atmosphere and Landed Meteorites)
        const px = this.centerX + Math.cos(this.planet.angle) * this.planet.radius;
        const py = this.centerY + Math.sin(this.planet.angle) * this.planet.radius;

        // Atmosphere Ring
        const atmosGrad = this.ctx.createRadialGradient(
            px, py, this.planet.size,
            px, py, this.planet.atmosRadius
        );
        atmosGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)'); // Blue atmosphere glow
        atmosGrad.addColorStop(1, 'transparent');

        this.ctx.fillStyle = atmosGrad;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.planet.atmosRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Planet Body
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.planet.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Landed Meteorites rotating with the planet
        this.ctx.fillStyle = '#9ca3af';
        this.meteorites.forEach(met => {
            const angle = this.planet.angle + met.relAngle;
            const mx = px + Math.cos(angle) * met.dist;
            const my = py + Math.sin(angle) * met.dist;

            this.ctx.beginPath();
            this.ctx.arc(mx, my, met.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // 6. Draw active Meteors / Meteoroids
        this.meteors.forEach(m => {
            // Draw trail
            if (m.trail.length > 1) {
                this.ctx.beginPath();
                this.ctx.moveTo(m.trail[0].x, m.trail[0].y);
                for (let i = 1; i < m.trail.length; i++) {
                    this.ctx.lineTo(m.trail[i].x, m.trail[i].y);
                }
                
                this.ctx.lineWidth = m.size * 0.6;
                if (m.state === 'meteor') {
                    // Burning fire tail
                    const trailGrad = this.ctx.createLinearGradient(
                        m.trail[0].x, m.trail[0].y, m.x, m.y
                    );
                    trailGrad.addColorStop(0, 'transparent');
                    trailGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
                    trailGrad.addColorStop(1, 'rgba(251, 146, 60, 0.8)');
                    this.ctx.strokeStyle = trailGrad;
                } else {
                    // standard gray dust trail
                    this.ctx.strokeStyle = 'rgba(156, 163, 175, 0.15)';
                }
                this.ctx.stroke();
            }

            // Head representation
            this.ctx.beginPath();
            this.ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);

            if (m.state === 'meteor') {
                // Burning Meteor (Glows Yellow/Orange/Red)
                const fireGrad = this.ctx.createRadialGradient(
                    m.x, m.y, 0,
                    m.x, m.y, m.size * 2
                );
                fireGrad.addColorStop(0, '#ffffff');
                fireGrad.addColorStop(0.4, 'rgba(251, 146, 60, 0.9)'); // Orange
                fireGrad.addColorStop(1, 'transparent');

                this.ctx.fillStyle = fireGrad;
                this.ctx.beginPath();
                this.ctx.arc(m.x, m.y, m.size * 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Meteoroid (Rocky gray)
                this.ctx.fillStyle = '#9ca3af';
                this.ctx.fill();
            }
        });

        // 7. Draw Explosion Waves
        this.explosions.forEach(exp => {
            this.ctx.strokeStyle = `rgba(239, 68, 68, ${exp.alpha})`;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        const tick = () => {
            if (!this.isAnimating) return;
            this.updatePhysics();
            this.draw();
            requestAnimationFrame(tick);
        };
        tick();
    }

    stopAnimation() {
        this.isAnimating = false;
    }
}
