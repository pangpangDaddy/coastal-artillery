import { ERAS, STAGES } from './data';
import { lang, nameOf, t, toggleLang } from './i18n';
import { VIEW_H, VIEW_W } from './types';

const LANG_BTN = { x: VIEW_W - 190, y: 16, w: 174, h: 32 };

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
    if (cx >= LANG_BTN.x && cx <= LANG_BTN.x + LANG_BTN.w && cy >= LANG_BTN.y && cy <= LANG_BTN.y + LANG_BTN.h) {
      toggleLang();
      return null;
    }
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

    // language toggle button
    ctx.fillStyle = '#1c2027';
    ctx.fillRect(LANG_BTN.x, LANG_BTN.y, LANG_BTN.w, LANG_BTN.h);
    ctx.strokeStyle = '#4a5260';
    ctx.strokeRect(LANG_BTN.x, LANG_BTN.y, LANG_BTN.w, LANG_BTN.h);
    ctx.fillStyle = '#c9ccd2';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lang === 'zh' ? 'EN / 中文 ✓' : 'EN ✓ / 中文', LANG_BTN.x + LANG_BTN.w / 2, LANG_BTN.y + 21);

    if (this.screen === 'title') {
      ctx.fillStyle = '#e8e6e0';
      ctx.font = 'bold 64px monospace';
      ctx.fillText('COASTAL ARTILLERY', VIEW_W / 2, 200);
      ctx.fillStyle = '#8a8f98';
      ctx.font = '18px monospace';
      ctx.fillText(t('tagline'), VIEW_W / 2, 244);
      ctx.fillStyle = '#c9ccd2';
      ctx.font = '16px monospace';
      const blink = Math.sin(time * 3) > -0.3;
      if (blink) ctx.fillText(t('clickStart'), VIEW_W / 2, 330);
      ctx.fillStyle = '#5a5f68';
      ctx.font = '13px monospace';
      ctx.fillText('1914 · 1939 · 2026', VIEW_W / 2, 300);
      return;
    }

    // stage select
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(t('selectCampaign'), VIEW_W / 2, 80);
    this.cards = [];
    const colW = 340;
    const gap = 30;
    const startX = (VIEW_W - colW * 3 - gap * 2) / 2;
    ERAS.forEach((era, ei) => {
      const cx = startX + ei * (colW + gap);
      ctx.fillStyle = '#c9ccd2';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(lang === 'zh' ? nameOf(era.id, era.name) : era.name.toUpperCase(), cx + colW / 2, 140);
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
        ctx.fillText(`${si + 1}. ${nameOf(stage.id, stage.name)}`, cx + colW / 2, y + 34);
        ctx.font = '12px monospace';
        ctx.fillStyle = locked ? '#3a3d45' : '#7d8390';
        ctx.fillText(locked ? t('lockedHint') : stage.bossAt ? t('flagshipBattle') : t('navalAssault'), cx + colW / 2, y + 60);
        this.cards.push({ id: stage.id, x: cx, y, w: colW, h: 92, locked });
      });
    });
    ctx.fillStyle = '#5a5f68';
    ctx.font = '13px monospace';
    ctx.fillText(t('controlsMenu'), VIEW_W / 2, VIEW_H - 40);
  }
}
