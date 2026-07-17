/**
 * Project: VINARANG (EXPRESS V4)
 * Author: Damso Universe
 */

const siteConfig = {
    meta: {
        framework: 'V1',
        type: 'screen',
        lang: 'ko',
        theme: false,
        symbol: false
    },
    canvas: {
        target: '.damso-header',
        effect: 'heartEffect',
        overlay: 'dotted',
        image_path: './section/bg/',
        image_count: 5,
        image_slide: 7,
        image_format: 'webp',
        standalone: true
    },
    buttons: [
        { name: 'Contact', icon: 'mail', url: '#contact' },
        { name: 'Search', icon: 'search', url: '#search' },
        { name: 'Youtube', icon: 'play_arrow', url: 'https://www.youtube.com/@vinarang' }
    ]
};

/**
 * Heart Effect Plugin for V4
 */
const heartEffectPlugin = {
    init(wrapper) {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'damso-canvas__effect';
        wrapper.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.hearts = [];
        this.heartCount = 30;
        this.heartColors = [];

        this.Heart = class {
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
                ctx.fillStyle = this.color.replace(/rgba?\(([^,]+),([^,]+),([^,]+)(?:,[^)]+)?\)/, `rgba($1,$2,$3,${this.opacity})`);
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
        };

        this.updateColors();
        this.handleResize();

        window.addEventListener('resize', () => this.handleResize());
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

    handleResize() {
        if (!this.canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.logicalWidth = rect.width;
        this.logicalHeight = rect.height;
        this.createHearts();
    },

    createHearts() {
        this.hearts = [];
        for (let i = 0; i < this.heartCount; i++) {
            this.hearts.push(new this.Heart(this.logicalWidth, this.logicalHeight, this.heartColors));
        }
    },

    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        this.hearts.forEach(heart => {
            heart.update(this.logicalWidth, this.logicalHeight);
            heart.draw(this.ctx);
        });
    }
};

/**
 * Initialize V4 Application
 */
window.addEventListener('DOMContentLoaded', async () => {
    if (!window.V4) return;

    // Register Effect
    window.V4.Effects = window.V4.Effects || {};
    window.V4.Effects.heartEffect = heartEffectPlugin;

    // Initialize Engine
    await window.V4.init(siteConfig);
});
