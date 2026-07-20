import { ERAS, STAGES } from './data';
import { VIEW_H, VIEW_W } from './types';

const SAVE_KEY = 'coastal-artillery-progress';

export function loadUnlocked(): number {
  try {
    const v = localStorage.getItem(SAVE_KEY);
    return v === null ? 0 : Math.max(0, parseInt(v, 10) || 0);
  } catch { return 0; }
}

export function saveUnlocked(idx: number) {
  try {
    localStorage.setItem(SAVE_KEY, String(Math.max(loadUnlocked(), idx)));
  } catch { /* ignore */ }
}

export interface MenuResult {
  stageId: string | null;
}

export class Menu {
  screen: 'title' | 'stages' = 'title';
  unlocked: number;
  private cards: { id: string; x: number; y: number; w: number; h: number; locked: boolean }[] = [];

  constructor(unlockAll = false) {
    this.unlocked = unlockAll ? STAGES.length - 1 : loadUnlocked();
  }

  // returns stage id if one was chosen
  click(cx: number, cy: number): string | null {
    if (this.screen === 'title') {
      this.screen = 'stages';
      return null;
    }
    for (const c of this.cards) {
      if (!c.locked && cx >= c.x && cx <= c.x + c.w && cy >= c.y && cy <= c.y + c.h) return c.id;
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D, time: number) {
    ctx.fillStyle = '#101114';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // decorative sea line
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, VIEW_H * 0.72, VIEW_W, VIEW_H * 0.28);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 8; i++) {
      const y = VIEW_H * 0.74 + i * 22;
      const off = (time * 20 + i * 130) % VIEW_W;
      ctx.fillRect(off - VIEW_W, y, 90, 2);
      ctx.fillRect(off, y, 90, 2);
    }

    ctx.textAlign = 'center';
    if (this.screen === 'title') {
      ctx.fillStyle = '#e8e6e0';
      ctx.font = 'bold 64px monospace';
      ctx.fillText('COASTAL ARTILLERY', VIEW_W / 2, 200);
      ctx.fillStyle = '#8a8f98';
      ctx.font = '18px monospace';
      ctx.fillText('Three eras of naval warfare. One coastline to hold.', VIEW_W / 2, 244);
      ctx.fillStyle = '#c9ccd2';
      ctx.font = '16px monospace';
      const blink = Math.sin(time * 3) > -0.3;
      if (blink) ctx.fillText('— CLICK TO START —', VIEW_W / 2, 330);
      ctx.fillStyle = '#5a5f68';
      ctx.font = '13px monospace';
      ctx.fillText('1914 · 1939 · 2026', VIEW_W / 2, 300);
      return;
    }

    // stage select
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('SELECT CAMPAIGN', VIEW_W / 2, 80);
    this.cards = [];
    const colW = 340;
    const gap = 30;
    const startX = (VIEW_W - colW * 3 - gap * 2) / 2;
    ERAS.forEach((era, ei) => {
      const cx = startX + ei * (colW + gap);
      ctx.fillStyle = '#c9ccd2';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(era.name.toUpperCase(), cx + colW / 2, 140);
      ctx.fillStyle = '#6a6f78';
      ctx.font = '13px monospace';
      ctx.fillText(era.years, cx + colW / 2, 162);
      const eraStages = STAGES.filter(s => s.era === era.id);
      eraStages.forEach((stage, si) => {
        const idx = STAGES.indexOf(stage);
        const locked = idx > this.unlocked;
        const y = 190 + si * 108;
        ctx.fillStyle = locked ? '#181a1e' : '#22262e';
        ctx.fillRect(cx, y, colW, 92);
        ctx.strokeStyle = locked ? '#2a2d33' : '#4a5260';
        ctx.strokeRect(cx, y, colW, 92);
        ctx.fillStyle = locked ? '#4a4d55' : '#e8e6e0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`${si + 1}. ${stage.name}`, cx + colW / 2, y + 34);
        ctx.font = '12px monospace';
        ctx.fillStyle = locked ? '#3a3d45' : '#7d8390';
        ctx.fillText(locked ? '🔒 Complete previous stages' : stage.bossAt ? 'Flagship battle' : 'Naval assault', cx + colW / 2, y + 60);
        this.cards.push({ id: stage.id, x: cx, y, w: colW, h: 92, locked });
      });
    });
    ctx.fillStyle = '#5a5f68';
    ctx.font = '13px monospace';
    ctx.fillText('Controls: ←/→ or A/D scroll · click buttons to build · M mute', VIEW_W / 2, VIEW_H - 40);
  }
}
