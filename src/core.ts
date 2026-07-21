import { HUD_H, RADAR_H, RADAR_W, RADAR_X, RADAR_Y, VIEW_H, VIEW_W, WORLD_W } from './types';

export class Input {
  keys = new Set<string>();
  mouseX = 0;
  mouseY = 0;
  clicked = false;
  clickX = 0;
  clickY = 0;
  leftDown = false;
  usingTouch = false;
  private wheelAcc = 0;
  private panAcc = 0;
  private panning = false;
  private touchId: number | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchDragging = false;

  constructor(canvas: HTMLCanvasElement, toLogical: (cx: number, cy: number) => [number, number]) {
    window.addEventListener('keydown', e => {
      this.keys.add(e.code);
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const [lx, ly] = toLogical(e.clientX - r.left, e.clientY - r.top);
      if (this.panning) this.panAcc += lx - this.mouseX;
      this.mouseX = lx;
      this.mouseY = ly;
      this.usingTouch = false;
    });
    canvas.addEventListener('mousedown', e => {
      const r = canvas.getBoundingClientRect();
      const [lx, ly] = toLogical(e.clientX - r.left, e.clientY - r.top);
      this.mouseX = lx;
      this.mouseY = ly;
      this.usingTouch = false;
      if (e.button === 0) {
        this.clickX = lx;
        this.clickY = ly;
        this.clicked = true;
        this.leftDown = true;
      } else if (e.button === 2 || e.button === 1) {
        this.panning = true;
        e.preventDefault();
      }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) this.leftDown = false;
      else this.panning = false;
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.wheelAcc += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    }, { passive: false });

    const touchPoint = (e: TouchEvent): Touch | null => {
      for (const t of Array.from(e.changedTouches)) {
        if (this.touchId === null || t.identifier === this.touchId) return t;
      }
      return null;
    };
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      if (this.touchId !== null) return;
      const t = e.changedTouches[0];
      this.touchId = t.identifier;
      this.usingTouch = true;
      const r = canvas.getBoundingClientRect();
      const [lx, ly] = toLogical(t.clientX - r.left, t.clientY - r.top);
      this.mouseX = lx;
      this.mouseY = ly;
      this.touchStartX = lx;
      this.touchStartY = ly;
      this.touchDragging = false;
      // radar scrubbing reuses the mouse leftDown path
      if (inRadar(lx, ly)) this.leftDown = true;
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const t = touchPoint(e);
      if (!t || this.touchId === null) return;
      const r = canvas.getBoundingClientRect();
      const [lx, ly] = toLogical(t.clientX - r.left, t.clientY - r.top);
      if (!this.leftDown) {
        if (!this.touchDragging &&
            Math.hypot(lx - this.touchStartX, ly - this.touchStartY) > 12) {
          this.touchDragging = true;
        }
        if (this.touchDragging) this.panAcc += lx - this.mouseX;
      }
      this.mouseX = lx;
      this.mouseY = ly;
    }, { passive: false });
    const touchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const t = touchPoint(e);
      if (!t || this.touchId === null) return;
      this.touchId = null;
      const wasRadar = this.leftDown;
      this.leftDown = false;
      if (!this.touchDragging && !wasRadar) {
        this.clickX = this.touchStartX;
        this.clickY = this.touchStartY;
        this.clicked = true;
      }
      this.touchDragging = false;
    };
    canvas.addEventListener('touchend', touchEnd, { passive: false });
    canvas.addEventListener('touchcancel', touchEnd, { passive: false });

    window.addEventListener('blur', () => {
      this.keys.clear();
      this.leftDown = false;
      this.panning = false;
      this.touchId = null;
      this.touchDragging = false;
    });
  }

  pressed(code: string): boolean {
    return this.keys.has(code);
  }

  consumeClick(): [number, number] | null {
    if (!this.clicked) return null;
    this.clicked = false;
    return [this.clickX, this.clickY];
  }

  consumeWheel(): number {
    const w = this.wheelAcc;
    this.wheelAcc = 0;
    return w;
  }

  consumePan(): number {
    const p = this.panAcc;
    this.panAcc = 0;
    return p;
  }
}

export function radarToWorldX(mx: number): number {
  return ((mx - RADAR_X) / RADAR_W) * WORLD_W;
}

export function inRadar(mx: number, my: number): boolean {
  return mx >= RADAR_X && mx <= RADAR_X + RADAR_W && my >= RADAR_Y && my <= RADAR_Y + RADAR_H;
}

export class Camera {
  x = 0;
  shakeX = 0;
  shakeY = 0;
  private target: number | null = null;

  jumpTo(worldX: number) {
    this.target = worldX - VIEW_W / 2;
  }

  update(dt: number, input: Input, shake: number) {
    const speed = 900;
    let manual = false;

    if (input.pressed('ArrowLeft') || input.pressed('KeyA')) { this.x -= speed * dt; manual = true; }
    if (input.pressed('ArrowRight') || input.pressed('KeyD')) { this.x += speed * dt; manual = true; }

    // edge scroll (disabled while cursor is over the HUD panel or on touch devices)
    if (!input.usingTouch && input.mouseY < VIEW_H - HUD_H) {
      if (input.mouseX < 36) { this.x -= speed * 0.8 * dt; manual = true; }
      if (input.mouseX > VIEW_W - 36) { this.x += speed * 0.8 * dt; manual = true; }
    }

    const wheel = input.consumeWheel();
    if (wheel !== 0) { this.x += wheel * 1.4; manual = true; }

    const pan = input.consumePan();
    if (pan !== 0) { this.x -= pan * 1.6; manual = true; }

    // radar click / drag: hold left button on the minimap to scrub the camera
    if (input.leftDown && inRadar(input.mouseX, input.mouseY)) {
      this.x = radarToWorldX(input.mouseX) - VIEW_W / 2;
      manual = true;
    }

    if (input.pressed('KeyQ') || input.pressed('Home')) this.target = 0;
    if (input.pressed('KeyE') || input.pressed('End')) this.target = WORLD_W - VIEW_W;

    if (manual) this.target = null;
    if (this.target !== null) {
      const t = Math.max(0, Math.min(WORLD_W - VIEW_W, this.target));
      const d = t - this.x;
      this.x += d * Math.min(1, dt * 12);
      if (Math.abs(d) < 2) { this.x = t; this.target = null; }
    }

    this.x = Math.max(0, Math.min(WORLD_W - VIEW_W, this.x));
    this.shakeX = (Math.random() - 0.5) * shake;
    this.shakeY = (Math.random() - 0.5) * shake * 0.6;
  }
}

export class Loop {
  private last = 0;
  private acc = 0;
  private readonly step = 1 / 60;
  running = false;

  constructor(private updateFn: (dt: number) => void, private renderFn: () => void) {}

  start() {
    this.running = true;
    this.last = performance.now();
    const frame = (t: number) => {
      if (!this.running) return;
      const elapsed = Math.min(0.1, (t - this.last) / 1000);
      this.last = t;
      this.acc += elapsed;
      while (this.acc >= this.step) {
        this.updateFn(this.step);
        this.acc -= this.step;
      }
      this.renderFn();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
