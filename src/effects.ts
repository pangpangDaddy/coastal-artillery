import { SEA_Y } from './types';

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
  kind: 'spark' | 'smoke' | 'splash' | 'ring' | 'debris' | 'flash' | 'tracer';
  gravity: number;
}

export class Effects {
  particles: Particle[] = [];
  shake = 0;

  private add(p: Particle) {
    if (this.particles.length < 900) this.particles.push(p);
  }

  explosion(x: number, y: number, scale = 1) {
    this.add({ x, y, vx: 0, vy: 0, life: 0.18, maxLife: 0.18, size: 26 * scale, color: '#fff', kind: 'flash', gravity: 0 });
    this.add({ x, y, vx: 0, vy: 0, life: 0.5, maxLife: 0.5, size: 10 * scale, color: '#2b2b2b', kind: 'ring', gravity: 0 });
    const n = Math.round(10 * scale);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 160 * scale;
      this.add({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: 0.4 + Math.random() * 0.5, maxLife: 0.9, size: 2 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#1c1c1c' : '#5a0f0f', kind: 'debris', gravity: 300,
      });
    }
    for (let i = 0; i < n; i++) {
      this.add({
        x: x + (Math.random() - 0.5) * 16, y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 40,
        life: 0.8 + Math.random() * 0.8, maxLife: 1.6, size: 5 + Math.random() * 8,
        color: 'rgba(60,60,60,0.55)', kind: 'smoke', gravity: -30,
      });
    }
    this.shake = Math.min(this.shake + 3 * scale, 14);
  }

  waterSplash(x: number, scale = 1) {
    for (let i = 0; i < 8 * scale; i++) {
      this.add({
        x: x + (Math.random() - 0.5) * 8, y: SEA_Y,
        vx: (Math.random() - 0.5) * 60, vy: -80 - Math.random() * 120 * scale,
        life: 0.4 + Math.random() * 0.3, maxLife: 0.7, size: 1.5 + Math.random() * 2.5,
        color: 'rgba(230,235,238,0.9)', kind: 'splash', gravity: 420,
      });
    }
  }

  muzzle(x: number, y: number) {
    this.add({ x, y, vx: 0, vy: 0, life: 0.07, maxLife: 0.07, size: 10, color: '#fff', kind: 'flash', gravity: 0 });
    this.add({ x, y, vx: 6, vy: -8, life: 0.5, maxLife: 0.5, size: 4, color: 'rgba(90,90,90,0.5)', kind: 'smoke', gravity: -20 });
  }

  tracer(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1, dy = y2 - y1;
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      this.add({
        x: x1 + dx * t, y: y1 + dy * t, vx: 0, vy: 0,
        life: 0.12, maxLife: 0.12, size: 1.6, color: 'rgba(40,40,40,0.7)', kind: 'tracer', gravity: 0,
      });
    }
  }

  wakeTrail(x: number, y: number) {
    this.add({
      x, y, vx: (Math.random() - 0.5) * 10, vy: 0,
      life: 0.6 + Math.random() * 0.4, maxLife: 1, size: 2 + Math.random() * 3,
      color: 'rgba(220,226,230,0.5)', kind: 'splash', gravity: 0,
    });
  }

  funnelSmoke(x: number, y: number) {
    this.add({
      x, y, vx: -6 + (Math.random() - 0.5) * 8, vy: -24 - Math.random() * 12,
      life: 1.2 + Math.random(), maxLife: 2.2, size: 3 + Math.random() * 4,
      color: 'rgba(70,70,70,0.4)', kind: 'smoke', gravity: -12,
    });
  }

  update(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 26);
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      ctx.globalAlpha = Math.min(1, t * 1.6);
      ctx.fillStyle = p.color;
      if (p.kind === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1.6 - t * 1.2), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'flash') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t + 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }
}
