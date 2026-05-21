// Star Formation Particle Physics Simulator
export class StarFormationSim {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.stage = 1; // 1: Cloud, 2: Collapse/Protostar, 3: Fusion/Main Sequence
        this.coreTemp = 15; // Kelvin
        this.coreDensity = 1.0; // arbitrary multiplier
        this.coreRadius = 0;
        this.fusionFlash = 0;
        this.isAnimating = false;
        this.collapseProgress = 0;

        // HUD elements
        this.tempEl = document.getElementById('star-temp');
        this.densityEl = document.getElementById('star-density');
        this.stageEl = document.getElementById('star-stage');
        this.triggerBtn = document.getElementById('star-trigger-btn');

        // Steps indicator elements
        this.step1El = document.getElementById('star-step-1');
        this.step2El = document.getElementById('star-step-2');
        this.step3El = document.getElementById('star-step-3');

        this.init();
    }

    init() {
        this.resize();
        this.resetCloud();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Adjust coordinate system based on display size
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width || 600;
        this.canvas.height = rect.height || 450;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    resetCloud() {
        this.stage = 1;
        this.coreTemp = 15;
        this.coreDensity = 1.2;
        this.coreRadius = 0;
        this.fusionFlash = 0;
        this.collapseProgress = 0;
        this.particles = [];

        this.updateHUD('Molecular Cloud', this.coreTemp, this.coreDensity);
        this.updateSteps();

        if (this.triggerBtn) {
            this.triggerBtn.innerText = 'Compress Gas Cloud';
            this.triggerBtn.disabled = false;
        }

        // Generate gas and dust particles floating randomly
        const numParticles = 400;
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (this.canvas.width * 0.45);
            this.particles.push({
                x: this.centerX + Math.cos(angle) * distance,
                y: this.centerY + Math.sin(angle) * distance,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 2 + 0.5,
                color: this.getRandomGasColor(),
                alpha: Math.random() * 0.5 + 0.3
            });
        }
    }

    getRandomGasColor() {
        const colors = [
            '147, 51, 234',  // Purple dust
            '59, 130, 246',  // Blue gas
            '236, 72, 153',  // Pink nebula
            '173, 216, 230'  // Cyan gas
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    triggerCollapse() {
        if (this.stage === 1) {
            this.stage = 2;
            this.updateSteps();
            if (this.triggerBtn) {
                this.triggerBtn.innerText = 'Ignite Fusion';
                this.triggerBtn.disabled = true; // Wait for compress progress
            }
        } else if (this.stage === 2 && this.collapseProgress >= 0.9) {
            this.stage = 3;
            this.fusionFlash = 1.0;
            this.updateSteps();
            if (this.triggerBtn) {
                this.triggerBtn.innerText = 'System Stabilized';
                this.triggerBtn.disabled = true;
            }
        }
    }

    updateHUD(stageText, temp, density) {
        if (this.stageEl) this.stageEl.innerText = stageText;
        if (this.tempEl) this.tempEl.innerText = Math.round(temp).toLocaleString();
        if (this.densityEl) this.densityEl.innerText = density.toFixed(2);
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
        if (this.stage === 1) {
            // Drift particles slightly within bounds
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off virtual boundary
                const dx = p.x - this.centerX;
                const dy = p.y - this.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > this.canvas.width * 0.48) {
                    p.vx = -p.vx;
                    p.vy = -p.vy;
                    p.x += p.vx;
                    p.y += p.vy;
                }
            });
        } 
        else if (this.stage === 2) {
            // Gravitational collapse toward the center
            this.collapseProgress += 0.003;
            if (this.collapseProgress > 1) this.collapseProgress = 1;

            if (this.collapseProgress >= 0.9 && this.triggerBtn) {
                this.triggerBtn.disabled = false; // Enable fusion ignition button
            }

            // Raise temp and density dynamically
            this.coreTemp = 15 + Math.pow(this.collapseProgress, 4) * 9999985; // reaching ~10M K
            this.coreDensity = 1.2 + Math.pow(this.collapseProgress, 2) * 50;
            this.coreRadius = this.collapseProgress * 35;

            this.updateHUD('Protostar Phase', this.coreTemp, this.coreDensity);

            this.particles.forEach(p => {
                const dx = this.centerX - p.x;
                const dy = this.centerY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    // Force matches 1 / r^2 gravity approximation
                    const force = (1.8 / (dist * dist)) * 120 * (1 + this.collapseProgress * 2);
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;

                    // Add friction drag to gather gas at center
                    p.vx *= 0.94;
                    p.vy *= 0.94;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Fade out particles that fall deep into the core
                if (dist < this.coreRadius) {
                    p.alpha = Math.max(0.05, p.alpha - 0.05);
                }
            });
        } 
        else if (this.stage === 3) {
            // Post-fusion ignition stabilization
            if (this.fusionFlash > 0) {
                this.fusionFlash -= 0.02; // flash fade
            }

            // Core temp fuses stably at 15M Kelvin
            if (this.coreTemp < 15000000) {
                this.coreTemp += (15000000 - this.coreTemp) * 0.1;
            }
            this.coreDensity = 78.50; // Stable core density
            this.coreRadius = 40;

            this.updateHUD('Main Sequence Star', this.coreTemp, this.coreDensity);

            // Shockwave pushes gas particles outwards
            this.particles.forEach(p => {
                const dx = p.x - this.centerX;
                const dy = p.y - this.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 180) {
                    // Outward solar wind pushes gas particles
                    const windForce = (8 / (dist + 10));
                    p.vx += (dx / (dist || 1)) * windForce;
                    p.vy += (dy / (dist || 1)) * windForce;

                    // Speed limit
                    p.vx = Math.min(6, Math.max(-6, p.vx));
                    p.vy = Math.min(6, Math.max(-6, p.vy));
                }

                p.x += p.vx;
                p.y += p.vy;

                // Slowly fade particles pushed too far out
                if (dist > this.canvas.width * 0.45) {
                    p.alpha = Math.max(0, p.alpha - 0.01);
                }
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw particle dust cloud
        this.particles.forEach(p => {
            if (p.alpha <= 0) return;
            this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw central protostar or fusion star
        if (this.stage === 2 && this.coreRadius > 0) {
            // Draw growing glowing core
            const grad = this.ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, this.coreRadius * 2
            );
            grad.addColorStop(0, 'rgba(255, 222, 173, 1)');
            grad.addColorStop(0.3, 'rgba(239, 68, 68, 0.8)');
            grad.addColorStop(0.6, 'rgba(102, 51, 153, 0.3)');
            grad.addColorStop(1, 'transparent');

            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.coreRadius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        } 
        else if (this.stage === 3) {
            // Draw stable glowing Main Sequence Star
            const pulse = Math.sin(Date.now() * 0.005) * 2;
            const radius = this.coreRadius + pulse;

            // Deep background glow
            const starGlow = this.ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, radius * 3.5
            );
            starGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
            starGlow.addColorStop(0.2, 'rgba(253, 224, 71, 0.9)');  // Gold
            starGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');   // Red
            starGlow.addColorStop(1, 'transparent');

            this.ctx.fillStyle = starGlow;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius * 3.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Core solid white sphere
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw coronal flares (wavy loops)
            this.ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI / 4) * i + (Date.now() * 0.0004);
                const startX = this.centerX + Math.cos(angle) * radius;
                const startY = this.centerY + Math.sin(angle) * radius;
                const controlX = this.centerX + Math.cos(angle) * (radius * 2) + Math.cos(angle + 0.5) * 15;
                const controlY = this.centerY + Math.sin(angle) * (radius * 2) + Math.sin(angle + 0.5) * 15;
                const endX = this.centerX + Math.cos(angle + 0.3) * radius;
                const endY = this.centerY + Math.sin(angle + 0.3) * radius;

                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.quadraticCurveTo(controlX, controlY, endX, endY);
                this.ctx.stroke();
            }
        }

        // Draw Fusion Flash explosion
        if (this.fusionFlash > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.fusionFlash})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
