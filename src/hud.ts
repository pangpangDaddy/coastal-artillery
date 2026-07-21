import type { Battle } from './battle';
import type { Camera, Input } from './core';
import { TURRETS, UNITS } from './data';
import { drawTurretIcon, drawUnitSilhouette } from './silhouettes';
import { turretSlotPos } from './entities';
import { HUD_H, RADAR_H, RADAR_W, RADAR_X, RADAR_Y, VIEW_H, VIEW_W, WORLD_W } from './types';
import { inRadar } from './core';
import { nameOf, shortName, t, lang } from './i18n';
import { isOwned, levelOf } from './armory';

const BTN = 56;
const BTN_GAP = 6;

export interface HudState {
  selectedTurret: string | null;
}

interface Button {
  kind: 'unit' | 'turret' | 'upgrade';
  id: string;
  x: number;
  y: number;
}

export class Hud {
  state: HudState = { selectedTurret: null };
  private buttons: Button[] = [];

  layout(b: Battle): Button[] {
    const btns: Button[] = [];
    let x = 14;
    const y = VIEW_H - HUD_H + 34;
    for (const id of b.stage.playerUnits) {
      btns.push({ kind: 'unit', id, x, y });
      x += BTN + BTN_GAP;
    }
    x += 18;
    for (const id of b.stage.playerTurrets) {
      btns.push({ kind: 'turret', id, x, y });
      x += BTN + BTN_GAP;
    }
    const ux = RADAR_X - 2 * (BTN + BTN_GAP) - 16;
    btns.push({ kind: 'upgrade', id: 'damage', x: ux, y });
    btns.push({ kind: 'upgrade', id: 'reload', x: ux + BTN + BTN_GAP, y });
    return btns;
  }

  handleClick(b: Battle, input: Input, cam: Camera) {
    const click = input.consumeClick();
    if (!click) return;
    const [cx, cy] = click;
    if (b.result) return;
    // radar clicks are handled by the camera
    if (inRadar(cx, cy)) return;
    // buttons
    for (const btn of this.buttons) {
      if (cx >= btn.x && cx <= btn.x + BTN && cy >= btn.y && cy <= btn.y + BTN) {
        if (btn.kind === 'unit') {
          if (!isOwned(btn.id)) { b.message = t('lockedEquip'); b.messageTimer = 2; return; }
          b.buyUnit(btn.id);
          this.state.selectedTurret = null;
        } else if (btn.kind === 'upgrade') {
          b.buyUpgrade(btn.id as 'damage' | 'reload');
          this.state.selectedTurret = null;
        } else {
          this.state.selectedTurret = this.state.selectedTurret === btn.id ? null : btn.id;
          b.sound.click();
        }
        return;
      }
    }
    // turret placement on cliff slots
    if (this.state.selectedTurret) {
      const wx = cx + cam.x;
      for (let s = 0; s < 4; s++) {
        const [sx, sy] = turretSlotPos('player', s);
        if (Math.abs(wx - sx) < 28 && cy > sy - 40 && cy < sy + 10) {
          if (b.buyTurret(this.state.selectedTurret, s)) this.state.selectedTurret = null;
          return;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, b: Battle, cam: Camera) {
    this.buttons = this.layout(b);

    // top base HP bars
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, VIEW_W, 30);
    bar(ctx, 20, 10, 320, 10, b.playerBaseHp / b.playerBaseMax, '#3f8a3f', `${t('base')} · ${b.nation.name[lang === 'zh' ? 1 : 0]}`);
    bar(ctx, VIEW_W - 340, 10, 320, 10, b.enemyBaseHp / b.enemyBaseMax, '#c22a2a', `${t('enemy')} · ${b.enemyNation.name[lang === 'zh' ? 1 : 0]}`);
    ctx.fillStyle = '#ddd';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${nameOf(b.era.id, b.era.name)} — ${nameOf(b.stage.id, b.stage.name)}`, VIEW_W / 2, 20);

    // message
    if (b.messageTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(VIEW_W / 2 - 220, 44, 440, 26);
      ctx.fillStyle = '#ffd75e';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(b.message, VIEW_W / 2, 62);
    }

    // bottom panel
    ctx.fillStyle = 'rgba(12,12,14,0.88)';
    ctx.fillRect(0, VIEW_H - HUD_H, VIEW_W, HUD_H);

    // resource + score
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ddd';
    ctx.font = '12px monospace';
    ctx.fillText(`${t('score')} ${b.score}`, 14, VIEW_H - HUD_H + 18);
    const resW = 220;
    ctx.fillStyle = '#333';
    ctx.fillRect(150, VIEW_H - HUD_H + 8, resW, 12);
    ctx.fillStyle = '#d8b13a';
    const resRatio = Math.min(1, b.resource / 800);
    ctx.fillRect(150, VIEW_H - HUD_H + 8, resW * resRatio, 12);
    ctx.fillStyle = '#111';
    ctx.fillText(`${t('res')} ${Math.floor(b.resource)}`, 156, VIEW_H - HUD_H + 18);

    // buttons
    for (const btn of this.buttons) {
      if (btn.kind === 'upgrade') {
        const track = btn.id as 'damage' | 'reload';
        const lvl = b.upgradeLevel(track);
        const cost = b.upgradeCost(track);
        const affordable = cost !== null && b.resource >= cost;
        ctx.fillStyle = cost === null ? '#20261e' : affordable ? '#1e2126' : '#141518';
        ctx.fillRect(btn.x, btn.y, BTN, BTN);
        ctx.strokeStyle = cost === null ? '#5a7a4a' : affordable ? '#666' : '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(btn.x, btn.y, BTN, BTN);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#999';
        ctx.font = '10px monospace';
        ctx.fillText(track === 'damage' ? t('upDmg') : t('upRof'), btn.x + BTN / 2, btn.y + 11);
        // up-arrow icon
        const iconColor = cost === null ? '#7ea86a' : affordable ? '#c9ccd2' : '#555';
        ctx.fillStyle = iconColor;
        ctx.beginPath();
        ctx.moveTo(btn.x + BTN / 2, btn.y + 18);
        ctx.lineTo(btn.x + BTN / 2 - 9, btn.y + 30);
        ctx.lineTo(btn.x + BTN / 2 + 9, btn.y + 30);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(btn.x + BTN / 2 - 3, btn.y + 30, 6, 8);
        // level pips
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < lvl ? '#e8c95c' : '#333';
          ctx.fillRect(btn.x + 14 + i * 14, btn.y + 43, 10, 5);
        }
        ctx.fillStyle = cost === null ? '#7ea86a' : affordable ? '#e8c95c' : '#555';
        ctx.font = '10px monospace';
        ctx.fillText(cost === null ? t('upMax') : `${cost}`, btn.x + BTN / 2, btn.y + BTN - 5);
        continue;
      }
      const def = btn.kind === 'unit' ? UNITS[btn.id] : TURRETS[btn.id];
      const locked = btn.kind === 'unit' && !isOwned(btn.id);
      const price = b.costOf(def);
      const affordable = !locked && b.resource >= price;
      const selected = btn.kind === 'turret' && this.state.selectedTurret === btn.id;
      ctx.fillStyle = selected ? '#3d4a63' : locked ? '#101014' : affordable ? '#1e2126' : '#141518';
      ctx.fillRect(btn.x, btn.y, BTN, BTN);
      ctx.strokeStyle = selected ? '#8ab4ff' : locked ? '#2a2a30' : affordable ? '#666' : '#333';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.strokeRect(btn.x, btn.y, BTN, BTN);

      const color = locked ? '#3a3a42' : affordable ? '#c9ccd2' : '#555';
      if (btn.kind === 'unit') {
        const u = UNITS[btn.id];
        drawUnitSilhouette(ctx, u.silhouette, u.layer, btn.x + BTN / 2, btn.y + BTN / 2 - 4, 0.55, 1, color);
      } else {
        drawTurretIcon(ctx, btn.id.startsWith('asm') ? 'turret_missile' : TURRETS[btn.id].silhouette, btn.x + BTN / 2, btn.y + BTN / 2 + 8, 0.8, color);
      }
      if (locked) {
        // padlock
        const lx = btn.x + BTN / 2, ly = btn.y + BTN / 2 + 2;
        ctx.strokeStyle = '#8a8f98';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(lx, ly - 4, 5, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#8a8f98';
        ctx.fillRect(lx - 7, ly - 4, 14, 11);
        ctx.lineWidth = 1;
        ctx.fillStyle = '#8a8f98';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'zh' ? '未解锁' : 'LOCKED', btn.x + BTN / 2, btn.y + BTN - 5);
      } else {
        ctx.fillStyle = affordable ? '#e8c95c' : '#555';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${price}`, btn.x + BTN / 2, btn.y + BTN - 5);
        // equipment level pips
        const lvl = levelOf(btn.id);
        for (let i = 0; i < lvl; i++) {
          ctx.fillStyle = '#e8c95c';
          ctx.fillRect(btn.x + 4, btn.y + BTN - 10 - i * 6, 4, 4);
        }
      }
      ctx.fillStyle = '#999';
      ctx.font = '10px monospace';
      ctx.fillText(shortName(btn.id, def.name), btn.x + BTN / 2, btn.y + 11);
    }

    // placement hint
    if (this.state.selectedTurret) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t('placeHint'), VIEW_W / 2, VIEW_H - HUD_H - 10);
    }

    // radar
    renderRadar(ctx, b, cam);

    // result overlay
    if (b.result) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.textAlign = 'center';
      ctx.fillStyle = b.result === 'win' ? '#7ee787' : '#ff6b5e';
      ctx.font = 'bold 52px monospace';
      ctx.fillText(b.result === 'win' ? t('victory') : t('defeat'), VIEW_W / 2, VIEW_H / 2 - 30);
      ctx.fillStyle = '#ddd';
      ctx.font = '16px monospace';
      ctx.fillText(`${t('scoreLabel')}: ${b.score}    ${t('timeLabel')}: ${Math.floor(b.time)}s`, VIEW_W / 2, VIEW_H / 2 + 10);
      ctx.fillStyle = '#e8c95c';
      ctx.fillText(`${t('xpEarned')}: +${b.xpGained} XP`, VIEW_W / 2, VIEW_H / 2 + 38);
      ctx.fillStyle = '#ddd';
      ctx.fillText(b.result === 'win' ? t('nextStage') : t('retry'), VIEW_W / 2, VIEW_H / 2 + 70);
    }
  }
}

function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, ratio: number, color: string, label: string) {
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, ratio), h);
  ctx.fillStyle = '#ddd';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 4, y + h - 2);
}

function renderRadar(ctx: CanvasRenderingContext2D, b: Battle, cam: Camera) {
  const rw = RADAR_W;
  const rh = RADAR_H;
  const rx = RADAR_X;
  const ry = RADAR_Y;
  ctx.fillStyle = '#0a0f14';
  ctx.fillRect(rx, ry, rw, rh);
  ctx.strokeStyle = '#2c3c46';
  ctx.strokeRect(rx, ry, rw, rh);
  const sx = (wx: number) => rx + (wx / WORLD_W) * rw;
  const sy = (wy: number) => ry + (wy / VIEW_H) * rh;
  // bases
  ctx.fillStyle = '#3f8a3f';
  ctx.fillRect(sx(40), ry + rh - 14, 5, 10);
  ctx.fillStyle = '#c22a2a';
  ctx.fillRect(sx(WORLD_W - 40), ry + rh - 14, 5, 10);
  for (const u of b.units) {
    ctx.fillStyle = u.side === 'player' ? '#e8e8e8' : '#ff4444';
    const s = u.def.boss ? 4 : u.def.size > 1.2 ? 3 : 2;
    ctx.fillRect(sx(u.x) - s / 2, sy(u.y) - s / 2, s, s);
  }
  for (const t of b.turrets) {
    ctx.fillStyle = t.side === 'player' ? '#9ecbff' : '#ff8888';
    ctx.fillRect(sx(t.x) - 1.5, sy(t.y) - 1.5, 3, 3);
  }
  // camera viewport
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.strokeRect(sx(cam.x), ry + 2, (VIEW_W / WORLD_W) * rw, rh - 4);
  ctx.fillStyle = '#8fa8b8';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(t('radarLabel'), rx + 4, ry + 10);
  ctx.fillStyle = '#5f7482';
  ctx.fillText(t('radarControls'), rx + 4, ry + rh + 12);
}
