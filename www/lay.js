/*
    Project: Canvas Express V1
    Last Modified: 2025-10-17
    Author: Maxim (www.maxim.pe.kr)
 */
const siteConfig = {
    TURNSTILE_SITE_KEY: '0x4AAAAAAB1Gk9ll6ulH4ZDi',
    icon_buttons: [
        { name: 'Youtube', icon: 'youtube_activity', url: 'https://www.youtube.com/@vinarang' },
    ],
    canvas_effect: 'heartEffect',
    
    // Updated canvas image settings
    canvas_image_type: 'cover', // 'none', 'cover', or 'repeat'
    canvas_image_slide: 10,
    canvas_image_count: 5,
    canvas_image_path: './section/bg/',
    canvas_image_format: 'jpg',
};

const heartEffect = {
    Heart: class {
        constructor(width, height, colors) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 15 + 5;
            this.speedX = (Math.random() - 0.5) * 1.2;
            this.speedY = (Math.random() - 0.5) * 1.2;
            this.angle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color.replace(/, [0-9\.]+\)/, `, ${this.opacity})`);
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, 0 + topCurveHeight);
            ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, 0 + topCurveHeight);
            ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, (this.size + topCurveHeight) / 2, 0, this.size);
            ctx.bezierCurveTo(0, (this.size + topCurveHeight) / 2, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, 0 + topCurveHeight);
            ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, 0 + topCurveHeight);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        update(width, height) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.rotationSpeed;
            if (this.x < -this.size * 2) this.x = width + this.size * 2;
            if (this.x > width + this.size * 2) this.x = -this.size * 2;
            if (this.y < -this.size * 2) this.y = height + this.size * 2;
            if (this.y > height + this.size * 2) this.y = -this.size * 2;
        }
    },

    init() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.hearts = [];
        this.heartCount = 30;
        this.heartColors = [];

        window.addEventListener('resize', () => this.handleResize(), false);

        this.updateColors();
        this.handleResize();
        this.animate();
    },

    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.createHearts();
    },
    
    updateColors() {
        const styles = getComputedStyle(document.documentElement);
        this.heartColors = [
            styles.getPropertyValue('--heart-color-1').trim() || 'rgba(255,182,193,0.7)',
            styles.getPropertyValue('--heart-color-2').trim() || 'rgba(255,192,203,0.7)',
            styles.getPropertyValue('--heart-color-3').trim() || 'rgba(255,228,225,0.7)',
            styles.getPropertyValue('--heart-color-4').trim() || 'rgba(238,130,238,0.7)'
        ];
    },

    createHearts() {
        this.hearts = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < this.heartCount; i++) {
            this.hearts.push(new this.Heart(w, h, this.heartColors));
        }
    },

    animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.hearts.forEach(heart => {
            heart.update(w, h);
            heart.draw(this.ctx);
        });
        requestAnimationFrame(this.animate.bind(this));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    CanvasExpress.registerEffect('heartEffect', heartEffect);
    CanvasExpress.init(siteConfig);
});

