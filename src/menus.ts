import { ERAS, STAGES, TURRETS, UNITS } from './data';
import { lang, nameOf, t, toggleLang } from './i18n';
import { getNation, NATIONS, setNation } from './nations';
import { buyEquip, canResearch, getXp, isOwned, levelOf, LEVEL_MAX, reqOf, TECH, upgradeEquip, upgradePrice } from './armory';
import { drawUnitSilhouette } from './silhouettes';
import { ownedPerks, perkName } from './perks';
import { VIEW_H, VIEW_W } from './types';

const ERA_THEME: Record<string, { accent: string; dim: string; panel: string; flagship: string; escort: string }> = {
  ww1: { accent: '#c9a15a', dim: '#6e5a38', panel: '#17150f', flagship: 'dreadnought', escort: 'biplane' },
  ww2: { accent: '#7fa3c7', dim: '#46586c', panel: '#121519', flagship: 'carrier', escort: 'fighter' },
  modern: { accent: '#5ad0c0', dim: '#356e66', panel: '#0f1717', flagship: 'aegis', escort: 'jet' },
};

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
  screen: 'title' | 'stages' | 'armory' = 'title';
  unlocked: number;
  private cards: { id: string; x: number; y: number; w: number; h: number; locked: boolean }[] = [];
  private nationBtns: { id: import('./nations').NationId; x: number; y: number; w: number; h: number }[] = [];
  private armoryBtn = { x: 16, y: 16, w: 150, h: 32 };
  private armoryRows: { id: string; action: 'buy' | 'upgrade'; x: number; y: number; w: number; h: number }[] = [];

  private unlockAll: boolean;

  constructor(unlockAll = false) {
    this.unlockAll = unlockAll;
    this.unlocked = unlockAll ? STAGES.length - 1 : loadUnlocked();
  }

  refreshUnlocked() {
    if (!this.unlockAll) this.unlocked = loadUnlocked();
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
    if (this.screen === 'armory') {
      if (cx >= this.armoryBtn.x && cx <= this.armoryBtn.x + this.armoryBtn.w && cy >= this.armoryBtn.y && cy <= this.armoryBtn.y + this.armoryBtn.h) {
        this.screen = 'stages';
        return null;
      }
      for (const r of this.armoryRows) {
        if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
          if (r.action === 'buy') buyEquip(r.id); else upgradeEquip(r.id);
          return null;
        }
      }
      return null;
    }
    if (cx >= this.armoryBtn.x && cx <= this.armoryBtn.x + this.armoryBtn.w && cy >= this.armoryBtn.y && cy <= this.armoryBtn.y + this.armoryBtn.h) {
      this.screen = 'armory';
      return null;
    }
    for (const nb of this.nationBtns) {
      if (cx >= nb.x && cx <= nb.x + nb.w && cy >= nb.y && cy <= nb.y + nb.h) {
        setNation(nb.id);
        return null;
      }
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

    if (this.screen === 'armory') {
      this.renderArmory(ctx);
      return;
    }

    // stage select
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(t('selectCampaign'), VIEW_W / 2, 80);
    // armory button
    ctx.fillStyle = '#26221a';
    ctx.fillRect(this.armoryBtn.x, this.armoryBtn.y, this.armoryBtn.w, this.armoryBtn.h);
    ctx.strokeStyle = '#8a713a';
    ctx.strokeRect(this.armoryBtn.x, this.armoryBtn.y, this.armoryBtn.w, this.armoryBtn.h);
    ctx.fillStyle = '#e8c95c';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${t('armoryBtn')} · ${getXp()} XP`, this.armoryBtn.x + this.armoryBtn.w / 2, this.armoryBtn.y + 21);
    this.cards = [];
    const colW = 340;
    const gap = 30;
    const startX = (VIEW_W - colW * 3 - gap * 2) / 2;
    ERAS.forEach((era, ei) => {
      const cx = startX + ei * (colW + gap);
      const th = ERA_THEME[era.id];
      // themed column panel
      ctx.fillStyle = th.panel;
      ctx.fillRect(cx - 10, 108, colW + 20, 452);
      ctx.strokeStyle = th.dim;
      ctx.strokeRect(cx - 10, 108, colW + 20, 452);
      ctx.fillStyle = th.accent;
      ctx.fillRect(cx - 10, 108, colW + 20, 3);
      // era header
      ctx.fillStyle = th.accent;
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'zh' ? nameOf(era.id, era.name) : era.name.toUpperCase(), cx + colW / 2, 140);
      ctx.fillStyle = '#6a6f78';
      ctx.font = '13px monospace';
      ctx.fillText(era.years, cx + colW / 2, 162);
      // flagship banner: sea line + era flagship & escort silhouettes drifting
      const by = 218;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, 172, colW, 66);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(cx, by, colW, 1.5);
      const drift = Math.sin(time * 0.6 + ei * 2.1) * 8;
      drawUnitSilhouette(ctx, th.flagship, 'sea', cx + colW / 2 + drift, by, 0.62, 1, th.dim);
      drawUnitSilhouette(ctx, th.escort, 'air', cx + colW / 2 - 90 - drift, 190, 0.5, 1, th.dim);
      ctx.restore();
      const eraStages = STAGES.filter(s => s.era === era.id);
      eraStages.forEach((stage, si) => {
        const idx = STAGES.indexOf(stage);
        const locked = idx > this.unlocked;
        const y = 252 + si * 102;
        ctx.fillStyle = locked ? '#181a1e' : '#22262e';
        ctx.fillRect(cx, y, colW, 88);
        ctx.strokeStyle = locked ? '#2a2d33' : th.dim;
        ctx.strokeRect(cx, y, colW, 88);
        if (!locked) { ctx.fillStyle = th.accent; ctx.fillRect(cx, y, 3, 88); }
        ctx.fillStyle = locked ? '#4a4d55' : '#e8e6e0';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`${si + 1}. ${nameOf(stage.id, stage.name)}`, cx + colW / 2, y + 34);
        ctx.font = '12px monospace';
        ctx.fillStyle = locked ? '#3a3d45' : '#7d8390';
        ctx.fillText(locked ? t('lockedHint') : stage.bossAt ? t('flagshipBattle') : t('navalAssault'), cx + colW / 2, y + 58);
        this.cards.push({ id: stage.id, x: cx, y, w: colW, h: 88, locked });
      });
    });
    // nation picker
    this.nationBtns = [];
    const current = getNation();
    const nW = 140, nGap = 12, nH = 40;
    const ids = NATIONS;
    const nStartX = (VIEW_W - (nW * ids.length + nGap * (ids.length - 1))) / 2;
    const nY = 584;
    ctx.font = '12px monospace';
    ctx.fillStyle = '#8a8f98';
    ctx.fillText(t('nationLabel'), VIEW_W / 2, nY - 8);
    ids.forEach((n, i) => {
      const x = nStartX + i * (nW + nGap);
      const sel = current.id === n.id;
      ctx.fillStyle = sel ? '#232a36' : '#171a1f';
      ctx.fillRect(x, nY, nW, nH);
      ctx.strokeStyle = sel ? n.color : '#33373f';
      ctx.lineWidth = sel ? 2 : 1;
      ctx.strokeRect(x, nY, nW, nH);
      if (sel) { ctx.fillStyle = n.color; ctx.fillRect(x, nY, 3, nH); }
      ctx.fillStyle = sel ? n.color : '#9aa0aa';
      ctx.font = sel ? 'bold 14px monospace' : '14px monospace';
      ctx.fillText(lang === 'zh' ? n.name[1] : n.name[0], x + nW / 2, nY + 25);
      this.nationBtns.push({ id: n.id, x, y: nY, w: nW, h: nH });
    });
    ctx.lineWidth = 1;
    ctx.fillStyle = current.color;
    ctx.font = '12px monospace';
    ctx.fillText(lang === 'zh' ? current.trait[1] : current.trait[0], VIEW_W / 2, nY + nH + 18);

    ctx.fillStyle = '#5a5f68';
    ctx.font = '13px monospace';
    ctx.fillText(t('controlsMenu'), VIEW_W / 2, VIEW_H - 40);

    const perks = ownedPerks();
    if (perks.length) {
      ctx.fillStyle = '#b89a3e';
      ctx.font = '12px monospace';
      ctx.fillText(perks.map(p => perkName(p)).join(' · '), VIEW_W / 2, VIEW_H - 20);
    }
  }

  private renderArmory(ctx: CanvasRenderingContext2D) {
    this.armoryRows = [];
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(t('armoryTitle'), VIEW_W / 2, 56);
    ctx.fillStyle = '#e8c95c';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${t('xpLabel')}: ${getXp()}`, VIEW_W / 2, 82);
    // back button
    ctx.fillStyle = '#1c2027';
    ctx.fillRect(this.armoryBtn.x, this.armoryBtn.y, this.armoryBtn.w, this.armoryBtn.h);
    ctx.strokeStyle = '#4a5260';
    ctx.strokeRect(this.armoryBtn.x, this.armoryBtn.y, this.armoryBtn.w, this.armoryBtn.h);
    ctx.fillStyle = '#c9ccd2';
    ctx.font = '13px monospace';
    ctx.fillText(t('backLabel'), this.armoryBtn.x + this.armoryBtn.w / 2, this.armoryBtn.y + 21);

    const chipW = 176, chipH = 44, gapX = 28, rowH = 54;
    const labelX = 36, chipX0 = 218;
    const xp = getXp();

    const drawChip = (id: string, x: number, y: number) => {
      const def = UNITS[id] ?? TURRETS[id];
      const owned = isOwned(id);
      const research = canResearch(id);
      const lvl = levelOf(id);
      const upPrice = owned ? upgradePrice(id) : null;
      ctx.fillStyle = owned ? '#1a2018' : research ? '#221e14' : '#141519';
      ctx.fillRect(x, y, chipW, chipH);
      ctx.strokeStyle = owned ? '#5a7a4a' : research ? '#8a713a' : '#2c2f36';
      ctx.strokeRect(x, y, chipW, chipH);
      ctx.textAlign = 'left';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = owned ? '#c9ccd2' : research ? '#d8bc6a' : '#565b64';
      const nm = nameOf(id, def.name);
      ctx.fillText(nm.length > 13 ? nm.slice(0, 13) : nm, x + 8, y + 16);
      ctx.font = '11px monospace';
      if (owned) {
        for (let i = 0; i < LEVEL_MAX; i++) {
          ctx.fillStyle = i < lvl ? '#e8c95c' : '#33373f';
          ctx.fillRect(x + 8 + i * 13, y + 26, 10, 5);
        }
        ctx.textAlign = 'right';
        if (upPrice === null) {
          ctx.fillStyle = '#7ea86a';
          ctx.fillText(t('maxLabel'), x + chipW - 8, y + 33);
        } else {
          const can = xp >= upPrice;
          ctx.fillStyle = can ? '#c9ccd2' : '#4a4d55';
          ctx.fillText(`${t('upgradeLabel')} ${upPrice}`, x + chipW - 8, y + 33);
          if (can) this.armoryRows.push({ id, action: 'upgrade', x, y, w: chipW, h: chipH });
        }
      } else if (research) {
        const price = TECH[id].price;
        const can = xp >= price;
        ctx.fillStyle = can ? '#e8c95c' : '#6e5a38';
        ctx.fillText(`${t('buyLabel')} ${price} XP`, x + 8, y + 33);
        if (can) this.armoryRows.push({ id, action: 'buy', x, y, w: chipW, h: chipH });
      } else {
        const req = reqOf(id);
        const reqDef = req ? (UNITS[req] ?? TURRETS[req]) : null;
        ctx.fillStyle = '#4a4d55';
        const rn = reqDef ? nameOf(req!, reqDef.name) : '';
        ctx.fillText(`🔒 ${t('reqLabel')} ${rn.length > 10 ? rn.slice(0, 10) : rn}`, x + 8, y + 33);
      }
      ctx.textAlign = 'center';
    };

    const drawLine = (label: [string, string], ids: string[], y: number, accent: string) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = accent;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(lang === 'zh' ? label[1] : label[0], labelX, y + chipH / 2 + 4);
      ids.forEach((id, i) => {
        const x = chipX0 + i * (chipW + gapX);
        if (i > 0) {
          ctx.fillStyle = isOwned(ids[i - 1]) ? '#8a8f98' : '#33373f';
          ctx.font = '14px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('→', x - gapX / 2, y + chipH / 2 + 5);
        }
        drawChip(id, x, y);
      });
      ctx.textAlign = 'center';
    };

    const section = (title: string, y: number) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8a8f98';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(title, labelX, y);
      ctx.strokeStyle = '#2c2f36';
      ctx.beginPath();
      ctx.moveTo(labelX + ctx.measureText(title).width + 14, y - 4);
      ctx.lineTo(VIEW_W - 36, y - 4);
      ctx.stroke();
      ctx.textAlign = 'center';
    };

    let y = 112;
    section(t('shipLinesTitle'), y);
    y += 10;
    drawLine(['DESTROYER LINE', '驱逐舰线'], ['gunboat', 'pt_boat', 'destroyer', 'lcs'], y, '#7fa3c7'); y += rowH;
    drawLine(['CRUISER LINE', '巡洋舰线'], ['cruiser_ww1', 'cruiser_ww2', 'missile_destroyer', 'aegis_cruiser'], y, '#7fa3c7'); y += rowH;
    drawLine(['BATTLESHIP LINE', '战列舰线'], ['dreadnought', 'battleship', 'carrier'], y, '#7fa3c7'); y += rowH;
    drawLine(['SUBMARINE LINE', '潜艇线'], ['uboat', 'submarine_ww2', 'nuke_sub'], y, '#7fa3c7'); y += rowH;
    y += 16;
    section(t('airTreeTitle'), y);
    y += 10;
    drawLine(['FIGHTER PATH', '战斗机路线'], ['biplane', 'fighter_ww2', 'jet_fighter'], y, '#c9a15a'); y += rowH;
    drawLine(['ATTACKER PATH', '攻击机路线'], ['zeppelin', 'dive_bomber', 'torpedo_bomber', 'uav'], y, '#c9a15a'); y += rowH;
    y += 16;
    section(t('turretSecTitle'), y);
    y += 10;
    const turretIds = Object.keys(TURRETS);
    const tChipW = 150, tGap = 12;
    turretIds.forEach((id, i) => {
      const col = i % 6, row = Math.floor(i / 6);
      drawChipNarrow(this, ctx, id, labelX + col * (tChipW + tGap), y + row * rowH, tChipW, chipH, xp);
    });

    function drawChipNarrow(menu: Menu, c: CanvasRenderingContext2D, id: string, x: number, cy2: number, w: number, h: number, curXp: number) {
      const def = TURRETS[id];
      const lvl = levelOf(id);
      const upPrice = upgradePrice(id);
      c.fillStyle = '#1a2018';
      c.fillRect(x, cy2, w, h);
      c.strokeStyle = '#3d5236';
      c.strokeRect(x, cy2, w, h);
      c.textAlign = 'left';
      c.font = 'bold 11px monospace';
      c.fillStyle = '#c9ccd2';
      const nm = nameOf(id, def.name);
      c.fillText(nm.length > 11 ? nm.slice(0, 11) : nm, x + 7, cy2 + 15);
      for (let i = 0; i < LEVEL_MAX; i++) {
        c.fillStyle = i < lvl ? '#e8c95c' : '#33373f';
        c.fillRect(x + 7 + i * 12, cy2 + 25, 9, 5);
      }
      c.textAlign = 'right';
      c.font = '10px monospace';
      if (upPrice === null) {
        c.fillStyle = '#7ea86a';
        c.fillText(t('maxLabel'), x + w - 7, cy2 + 32);
      } else {
        const can = curXp >= upPrice;
        c.fillStyle = can ? '#c9ccd2' : '#4a4d55';
        c.fillText(`${t('upgradeLabel')} ${upPrice}`, x + w - 7, cy2 + 32);
        if (can) menu.armoryRows.push({ id, action: 'upgrade', x, y: cy2, w, h });
      }
      c.textAlign = 'center';
    }
  }
}
