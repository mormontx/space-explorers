// Planet Formation Accretion Disk Physics Simulator
export class PlanetFormationSim {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.planetesimals = [];
        this.stage = 1; // 1: Disk, 2: Accretion, 3: Orbit Clear
        this.dustPercentage = 100;
        this.clearancePercentage = 0;
        this.isAnimating = false;
        this.accretionProgress = 0;

        // HUD elements
        this.countEl = document.getElementById('planet-count');
        this.dustEl = document.getElementById('planet-dust');
        this.clearedEl = document.getElementById('planet-cleared');
        this.triggerBtn = document.getElementById('planet-trigger-btn');

        // Steps indicator elements
        this.step1El = document.getElementById('planet-step-1');
        this.step2El = document.getElementById('planet-step-2');
        this.step3El = document.getElementById('planet-step-3');

        this.init();
    }

    init() {
        this.resize();
        this.resetDisk();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 600;
        this.canvas.height = rect.height || 450;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    resetDisk() {
        this.stage = 1;
        this.dustPercentage = 100;
        this.clearancePercentage = 0;
        this.accretionProgress = 0;
        this.particles = [];
        this.planetesimals = [];

        this.updateHUD(0, 100, 0);
        this.updateSteps();

        if (this.triggerBtn) {
            this.triggerBtn.innerText = 'Accrete Particles';
            this.triggerBtn.disabled = false;
        }

        // Generate a swirling disk of dust around a central young star
        const numParticles = 350;
        for (let i = 0; i < numParticles; i++) {
            // Distribute orbital radius (avoiding central star zone)
            const radius = Math.random() * (this.canvas.width * 0.38 - 45) + 45;
            const angle = Math.random() * Math.PI * 2;
            
            // Keplerian orbital speed (slower further out: speed proportional to 1 / sqrt(r))
            const speed = 0.5 * Math.sqrt(100 / radius);

            this.particles.push({
                radius: radius,
                angle: angle,
                speed: speed,
                size: Math.random() * 1.5 + 0.5,
                color: this.getRandomDustColor(radius),
                alpha: Math.random() * 0.4 + 0.2
            });
        }
    }

    getRandomDustColor(radius) {
        // Rocky colors closer in, icy colors further out
        if (radius < 110) {
            const rockColors = ['168, 162, 158', '120, 113, 108', '217, 119, 6']; // Brown, grey, iron-orange
            return rockColors[Math.floor(Math.random() * rockColors.length)];
        } else {
            const iceColors = ['186, 230, 253', '14, 165, 233', '165, 180, 252']; // Ice blue, cyan, volatile purple
            return iceColors[Math.floor(Math.random() * iceColors.length)];
        }
    }

    triggerAccretion() {
        if (this.stage === 1) {
            this.stage = 2;
            this.updateSteps();
            if (this.triggerBtn) {
                this.triggerBtn.innerText = 'Clear Orbit Lanes';
                this.triggerBtn.disabled = true; // Wait for planetesimal growth
            }
        } else if (this.stage === 2 && this.accretionProgress >= 0.8) {
            this.stage = 3;
            this.updateSteps();
            if (this.triggerBtn) {
                this.triggerBtn.innerText = 'Orbits Stable';
                this.triggerBtn.disabled = true;
            }
        }
    }

    updateHUD(planetesimals, dust, cleared) {
        if (this.countEl) this.countEl.innerText = planetesimals;
        if (this.dustEl) this.dustEl.innerText = Math.round(dust) + '%';
        if (this.clearedEl) this.clearedEl.innerText = Math.round(cleared) + '%';
    }

    updateSteps() {
        const resetSteps = () => {
            this.step1El?.classList.remove('current', 'done');
            this.step2El?.classList.remove('current', 'done');
            this.step3El?.classList.remove('current', 'done');
        };

        resetSteps();

        if (this.stage === 1) {
            this.step1El?.classList.add('current');
        } else if (this.stage === 2) {
            this.step1El?.classList.add('done');
            this.step2El?.classList.add('current');
        } else if (this.stage === 3) {
            this.step1El?.classList.add('done');
            this.step2El?.classList.add('done');
            this.step3El?.classList.add('current');
        }
    }

    updatePhysics() {
        // Spin dust particles in circles
        this.particles.forEach(p => {
            p.angle += p.speed * 0.05;
        });

        if (this.stage === 1) {
            // Simple rotation
            return;
        }

        if (this.stage === 2) {
            this.accretionProgress += 0.002;
            if (this.accretionProgress > 1) this.accretionProgress = 1;

            if (this.accretionProgress >= 0.8 && this.triggerBtn) {
                this.triggerBtn.disabled = false; // Enable orbital sweep button
            }

            // Spawn initial tiny seeds (planetesimals)
            if (this.planetesimals.length === 0) {
                // Let's seed 3 planetesimals at different orbits
                this.planetesimals.push(
                    { radius: 75, angle: 0, size: 2.5, speed: 0.5 * Math.sqrt(100/75), color: '217, 119, 6', type: 'rocky' },
                    { radius: 140, angle: Math.PI * 0.6, size: 3.5, speed: 0.5 * Math.sqrt(100/140), color: '14, 165, 233', type: 'gas-seed' },
                    { radius: 210, angle: Math.PI * 1.3, size: 3, speed: 0.5 * Math.sqrt(100/210), color: '165, 180, 252', type: 'icy' }
                );
            }

            // Orbit the planetesimals
            this.planetesimals.forEach(pl => {
                pl.angle += pl.speed * 0.05;
            });

            // Particles are drawn slightly towards the nearest planetesimal
            this.particles.forEach(p => {
                let nearestPl = null;
                let minDist = 99999;

                // Calculate x, y coordinates
                const px = this.centerX + Math.cos(p.angle) * p.radius;
                const py = this.centerY + Math.sin(p.angle) * p.radius;

                this.planetesimals.forEach(pl => {
                    const plx = this.centerX + Math.cos(pl.angle) * pl.radius;
                    const ply = this.centerY + Math.sin(pl.angle) * pl.radius;

                    const dx = plx - px;
                    const dy = ply - py;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < minDist) {
                        minDist = d;
                        nearestPl = pl;
                    }
                });

                if (nearestPl && minDist < 35) {
                    // Pull dust particle towards planetesimal
                    p.radius += (nearestPl.radius - p.radius) * 0.02;
                    p.angle += (nearestPl.angle - p.angle) * 0.02;

                    // If extremely close, accrete it (make particle transparent, grow planetesimal)
                    if (minDist < 6 && p.alpha > 0) {
                        p.alpha = 0; // Accreted
                        nearestPl.size = Math.min(10, nearestPl.size + 0.035); // Grow
                        this.dustPercentage = Math.max(10, this.dustPercentage - 0.25);
                    }
                }
            });

            this.updateHUD(this.planetesimals.length, this.dustPercentage, 20 + this.accretionProgress * 40);
        }

        if (this.stage === 3) {
            // Clear lanes fully
            if (this.clearancePercentage < 100) {
                this.clearancePercentage += 0.4;
            }
            if (this.dustPercentage > 8) {
                this.dustPercentage -= 0.15;
            }

            // Orbit the large protoplanets
            this.planetesimals.forEach((pl, idx) => {
                // If it is the gas giant seed (middle one), grow it into a giant gas envelope
                if (pl.type === 'gas-seed') {
                    pl.size = Math.min(18, pl.size + 0.08);
                } else {
                    pl.size = Math.min(10, pl.size + 0.02);
                }
                pl.angle += pl.speed * 0.05;
            });

            // Sweep dust in orbital lanes
            this.particles.forEach(p => {
                this.planetesimals.forEach(pl => {
                    // Clearance lane width depends on planet size
                    const laneWidth = pl.size * 1.5;
                    if (Math.abs(p.radius - pl.radius) < laneWidth) {
                        p.alpha = Math.max(0, p.alpha - 0.04); // Clear out
                    }
                });
            });

            this.updateHUD(this.planetesimals.length, this.dustPercentage, this.clearancePercentage);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw central protostar / sun
        const starGrad = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 30
        );
        starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        starGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.8)'); // Orange star core
        starGrad.addColorStop(1, 'transparent');

        this.ctx.fillStyle = starGrad;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw orbital guide circles for planetesimals
        if (this.stage >= 2) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            this.ctx.lineWidth = 1;
            this.planetesimals.forEach(pl => {
                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, pl.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            });
        }

        // Draw dust particles swirling
        this.particles.forEach(p => {
            if (p.alpha <= 0) return;
            const x = this.centerX + Math.cos(p.angle) * p.radius;
            const y = this.centerY + Math.sin(p.angle) * p.radius;

            this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw growing planetesimals
        if (this.stage >= 2) {
            this.planetesimals.forEach(pl => {
                const x = this.centerX + Math.cos(pl.angle) * pl.radius;
                const y = this.centerY + Math.sin(pl.angle) * pl.radius;

                // Glowing aura
                const plGlow = this.ctx.createRadialGradient(
                    x, y, 0,
                    x, y, pl.size * 2
                );
                plGlow.addColorStop(0, `rgba(${pl.color}, 1)`);
                plGlow.addColorStop(0.5, `rgba(${pl.color}, 0.3)`);
                plGlow.addColorStop(1, 'transparent');

                this.ctx.fillStyle = plGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, pl.size * 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Solid Core
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(x, y, pl.size * 0.7, 0, Math.PI * 2);
                this.ctx.fill();

                // Gas Giant Ring
                if (pl.type === 'gas-seed' && this.stage === 3) {
                    this.ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
                    this.ctx.lineWidth = 3;
                    this.ctx.save();
                    this.ctx.translate(x, y);
                    this.ctx.scale(1.5, 0.5); // Elongated ring
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, pl.size * 1.1, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            });
        }
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
