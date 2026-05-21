// Parallax Starfield & Shooting Stars Engine
export class Starfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.shootingStars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.numStars = 150;

        this.init();
    }

    init() {
        this.resize();
        this.createStars();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
            this.targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
        });

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createStars(); // Recreate stars to fit new resolution
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.8 + 0.2,
                color: this.getRandomStarColor(),
                speed: Math.random() * 0.05 + 0.01,
                depth: Math.random() * 0.8 + 0.2 // Parallax factor
            });
        }
    }

    getRandomStarColor() {
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(173, 216, 230, ', // Light blue star
            'rgba(255, 222, 173, ', // Light orange star
            'rgba(255, 192, 203, '  // Light pink star
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    addShootingStar() {
        if (this.shootingStars.length < 2 && Math.random() < 0.008) {
            this.shootingStars.push({
                x: Math.random() * this.canvas.width * 0.6,
                y: Math.random() * this.canvas.height * 0.4,
                length: Math.random() * 80 + 40,
                speed: Math.random() * 12 + 6,
                angle: Math.PI / 6 + Math.random() * (Math.PI / 12), // Downward angle
                opacity: 1,
                decay: Math.random() * 0.015 + 0.01
            });
        }
    }

    animate() {
        // Smooth mouse parallax motion
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Clear canvas
        this.ctx.fillStyle = '#050510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw nebulae background glow (radial gradients)
        const gradient1 = this.ctx.createRadialGradient(
            this.canvas.width * 0.7, this.canvas.height * 0.2, 50,
            this.canvas.width * 0.7, this.canvas.height * 0.2, 500
        );
        gradient1.addColorStop(0, 'rgba(102, 51, 153, 0.06)');
        gradient1.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const gradient2 = this.ctx.createRadialGradient(
            this.canvas.width * 0.2, this.canvas.height * 0.7, 50,
            this.canvas.width * 0.2, this.canvas.height * 0.7, 400
        );
        gradient2.addColorStop(0, 'rgba(0, 191, 255, 0.04)');
        gradient2.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw regular stars with parallax
        this.stars.forEach(star => {
            let x = star.x + (this.mouseX * star.depth);
            let y = star.y + (this.mouseY * star.depth);

            // Wrap stars around edge boundaries
            if (x < 0) x = this.canvas.width + x;
            if (x > this.canvas.width) x = x - this.canvas.width;
            if (y < 0) y = this.canvas.height + y;
            if (y > this.canvas.height) y = y - this.canvas.height;

            // Twinkle effect
            const twinkle = Math.abs(Math.sin(Date.now() * star.speed * 0.05)) * 0.5 + 0.5;
            this.ctx.fillStyle = `${star.color}${twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Add & animate shooting stars
        this.addShootingStar();
        this.shootingStars = this.shootingStars.filter(ss => {
            const dx = Math.cos(ss.angle) * ss.speed;
            const dy = Math.sin(ss.angle) * ss.speed;

            this.ctx.strokeStyle = `rgba(173, 216, 230, ${ss.opacity})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.moveTo(ss.x, ss.y);
            this.ctx.lineTo(ss.x + Math.cos(ss.angle) * ss.length, ss.y + Math.sin(ss.angle) * ss.length);
            this.ctx.stroke();

            // Draw glowing head
            this.ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(ss.x + Math.cos(ss.angle) * ss.length, ss.y + Math.sin(ss.angle) * ss.length, 1.2, 0, Math.PI * 2);
            this.ctx.fill();

            ss.x += dx;
            ss.y += dy;
            ss.opacity -= ss.decay;

            return ss.opacity > 0;
        });

        requestAnimationFrame(() => this.animate());
    }
}
