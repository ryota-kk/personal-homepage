class WaterRippleEffect {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.ripples = [];
    this.animationId = null;
    this.lastRippleAt = 0;
    this.boundAnimate = this.animate.bind(this);
    this.boundResize = this.resize.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundTouchMove = this.handleTouchMove.bind(this);
    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'water-ripple-canvas';
    this.ctx = this.canvas.getContext('2d');

    Object.assign(this.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '2',
    });

    this.container.appendChild(this.canvas);
    this.resize();

    window.addEventListener('resize', this.boundResize);
    this.container.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    this.container.addEventListener('touchmove', this.boundTouchMove, { passive: true });

    this.animate();
  }

  isMobile() {
    return window.matchMedia('(max-width: 640px)').matches || 'ontouchstart' in window;
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  createRipple(x, y) {
    return {
      x,
      y,
      radius: 0,
      maxRadius: this.isMobile() ? 60 : 80,
      alpha: 0.7,
      speed: 1,
      fadeSpeed: 0.008,
      life: 0,
      maxLife: 140,
    };
  }

  addRipple(clientX, clientY) {
    const now = performance.now();
    const minDelay = this.isMobile() ? 129 : 69;
    if (now - this.lastRippleAt < minDelay) return;

    const rect = this.container.getBoundingClientRect();
    this.ripples.push(this.createRipple(clientX - rect.left, clientY - rect.top));
    this.lastRippleAt = now;
  }

  handlePointerMove(event) {
    this.addRipple(event.clientX, event.clientY);
  }

  handleTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) return;
    this.addRipple(touch.clientX, touch.clientY);
  }

  drawRipple(ripple) {
    const progress = Math.min(1, ripple.life / ripple.maxLife);
    const alpha = Math.max(0, ripple.alpha * (1 - progress));

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'screen';

    const glow = this.ctx.createRadialGradient(
      ripple.x,
      ripple.y,
      Math.max(1, ripple.radius * 0.18),
      ripple.x,
      ripple.y,
      ripple.radius
    );
    glow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.18})`);
    glow.addColorStop(0.42, `rgba(100, 220, 220, ${alpha * 0.2})`);
    glow.addColorStop(1, 'rgba(100, 220, 220, 0)');
    this.ctx.fillStyle = glow;
    this.ctx.beginPath();
    this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.lineWidth = 1.6;
    this.ctx.strokeStyle = `rgba(100, 220, 220, ${alpha * 0.8})`;
    this.ctx.beginPath();
    this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
    this.ctx.beginPath();
    this.ctx.arc(ripple.x, ripple.y, ripple.radius * 0.56, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();
  }

  animate() {
    const rect = this.container.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    this.ripples = this.ripples.filter(ripple => {
      ripple.radius += ripple.speed;
      ripple.alpha -= ripple.fadeSpeed;
      ripple.life += 1;

      if (ripple.radius > ripple.maxRadius || ripple.alpha <= 0 || ripple.life > ripple.maxLife) {
        return false;
      }

      this.drawRipple(ripple);
      return true;
    });

    this.animationId = requestAnimationFrame(this.boundAnimate);
  }

  destroy() {
    window.removeEventListener('resize', this.boundResize);
    this.container.removeEventListener('pointermove', this.boundPointerMove);
    this.container.removeEventListener('touchmove', this.boundTouchMove);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }

    this.ripples = [];
  }
}

window.WaterRippleEffect = WaterRippleEffect;

document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.site-shell');
  if (!shell) return;

  window.sceneScrollWaterRipple = new WaterRippleEffect(shell);
});
