import { Battle } from './battle';
import { Camera, Input, Loop } from './core';
import { STAGES, nextStageId } from './data';
import { Hud } from './hud';
import { Menu, loadUnlocked, saveUnlocked } from './menus';
import { renderBattle } from './render';
import { VIEW_H, VIEW_W } from './types';
import { t } from './i18n';
import { PerkDef, perkDesc, perkName, rollChoices, takePerk } from './perks';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let scale = 1;
function resize() {
  const s = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  scale = s * (window.devicePixelRatio || 1);
  canvas.width = Math.round(VIEW_W * scale);
  canvas.height = Math.round(VIEW_H * scale);
  canvas.style.width = `${VIEW_W * s}px`;
  canvas.style.height = `${VIEW_H * s}px`;
}
window.addEventListener('resize', resize);
resize();

const input = new Input(canvas, (cx, cy) => {
  const r = canvas.getBoundingClientRect();
  return [(cx / r.width) * VIEW_W, (cy / r.height) * VIEW_H];
});

type Mode = 'menu' | 'battle';

const unlockAll = new URLSearchParams(location.search).has('unlock');
let mode: Mode = 'menu';
let menu = new Menu(unlockAll);
let battle: Battle | null = null;
let camera = new Camera();
let hud = new Hud();
let paused = false;
let muteToggled = false;
let escHeld = false;
let dcKeyHeld = false;
let unlockSaved = false;
let perkChoices: PerkDef[] | null = null;

const PERK_PANEL = { x: 160, y: 410, w: 960, h: 230 };
function perkCardRect(i: number): [number, number, number, number] {
  const cw = 296, ch = 150, gap = 18;
  const x0 = PERK_PANEL.x + (PERK_PANEL.w - (cw * 3 + gap * 2)) / 2;
  return [x0 + i * (cw + gap), PERK_PANEL.y + 62, cw, ch];
}

const PAUSE_BTN_W = 280, PAUSE_BTN_H = 46;
const PAUSE_RESUME = { x: VIEW_W / 2 - PAUSE_BTN_W / 2, y: VIEW_H / 2 + 10, w: PAUSE_BTN_W, h: PAUSE_BTN_H };
const PAUSE_MENU = { x: VIEW_W / 2 - PAUSE_BTN_W / 2, y: VIEW_H / 2 + 70, w: PAUSE_BTN_W, h: PAUSE_BTN_H };
const TOP_PAUSE = { x: VIEW_W - 96, y: 36, w: 40, h: 40 };
const TOP_MUTE = { x: VIEW_W - 50, y: 36, w: 40, h: 40 };
function inPauseBtn(p: [number, number], r: { x: number; y: number; w: number; h: number }): boolean {
  return p[0] >= r.x && p[0] <= r.x + r.w && p[1] >= r.y && p[1] <= r.y + r.h;
}
function drawPauseBtn(ctx: CanvasRenderingContext2D, r: { x: number; y: number; w: number; h: number }, label: string) {
  ctx.fillStyle = '#1e2126';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = '#e8e6e0';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 6);
}

function startStage(stageId: string) {
  battle = new Battle(stageId);
  camera = new Camera();
  hud = new Hud();
  camera.x = 0;
  mode = 'battle';
  unlockSaved = false;
}

function backToMenu() {
  mode = 'menu';
  menu = new Menu(unlockAll);
  battle = null;
  paused = false;
}

function update(dt: number) {
  if (input.pressed('KeyM') && !muteToggled) {
    muteToggled = true;
    if (battle) battle.sound.muted = !battle.sound.muted;
  }
  if (!input.pressed('KeyM')) muteToggled = false;

  if (mode === 'menu') {
    const click = input.consumeClick();
    if (click) {
      const stageId = menu.click(click[0], click[1]);
      if (stageId) startStage(stageId);
    }
    return;
  }

  if (!battle) return;

  if (input.pressed('Escape') && !escHeld) { escHeld = true; paused = !paused; }
  if (!input.pressed('Escape')) escHeld = false;

  // top-right screen buttons (mouse & touch)
  if (!battle.result && input.clicked) {
    const p: [number, number] = [input.clickX, input.clickY];
    if (inPauseBtn(p, TOP_PAUSE)) {
      input.consumeClick();
      paused = !paused;
      battle.sound.click();
    } else if (inPauseBtn(p, TOP_MUTE)) {
      input.consumeClick();
      battle.sound.muted = !battle.sound.muted;
    }
  }

  if (battle.result) {
    if (battle.result === 'win' && !unlockSaved) {
      unlockSaved = true;
      const idx = STAGES.findIndex(s => s.id === battle!.stage.id) + 1;
      const firstClear = loadUnlocked() < idx;
      saveUnlocked(idx);
      if (firstClear) {
        const choices = rollChoices(3);
        if (choices.length) perkChoices = choices;
      }
    }
    if (perkChoices) {
      const click = input.consumeClick();
      if (click) {
        for (let i = 0; i < perkChoices.length; i++) {
          const [x, y, w, h] = perkCardRect(i);
          if (click[0] >= x && click[0] <= x + w && click[1] >= y && click[1] <= y + h) {
            takePerk(perkChoices[i].id);
            perkChoices = null;
            battle.sound.click();
            break;
          }
        }
      }
      return;
    }
    if (input.pressed('Enter') || input.pressed('NumpadEnter') || input.consumeClick()) {
      if (battle.result === 'win') {
        const next = nextStageId(battle.stage.id);
        if (next) startStage(next); else backToMenu();
      } else {
        startStage(battle.stage.id);
      }
      input.keys.delete('Enter');
    }
    return;
  }

  if (paused) {
    const click = input.consumeClick();
    if (click) {
      if (inPauseBtn(click, PAUSE_RESUME)) { paused = false; battle.sound.click(); }
      else if (inPauseBtn(click, PAUSE_MENU)) { backToMenu(); }
    }
    return;
  }

  if (!paused) {
    camera.update(dt, input, battle.effects.shake);
    if (input.pressed('KeyR') && !dcKeyHeld) {
      dcKeyHeld = true;
      battle.useDamageControl();
    }
    if (!input.pressed('KeyR')) dcKeyHeld = false;
    hud.handleClick(battle, input, camera);
    battle.update(dt);
  }
  input.consumeClick();
}

function render() {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (mode === 'menu') {
    menu.render(ctx, performance.now() / 1000);
    return;
  }
  if (!battle) return;
  renderBattle(ctx, battle, camera);
  hud.render(ctx, battle, camera);
  if (!battle.result) {
    for (const r of [TOP_PAUSE, TOP_MUTE]) {
      ctx.fillStyle = 'rgba(12,12,14,0.7)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    ctx.fillStyle = '#c9ccd2';
    // pause icon
    ctx.fillRect(TOP_PAUSE.x + 13, TOP_PAUSE.y + 11, 5, 18);
    ctx.fillRect(TOP_PAUSE.x + 22, TOP_PAUSE.y + 11, 5, 18);
    // speaker icon
    const mx = TOP_MUTE.x, my = TOP_MUTE.y;
    ctx.beginPath();
    ctx.moveTo(mx + 10, my + 16);
    ctx.lineTo(mx + 16, my + 16);
    ctx.lineTo(mx + 23, my + 10);
    ctx.lineTo(mx + 23, my + 30);
    ctx.lineTo(mx + 16, my + 24);
    ctx.lineTo(mx + 10, my + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9ccd2';
    ctx.lineWidth = 2;
    if (battle.sound.muted) {
      ctx.beginPath();
      ctx.moveTo(mx + 27, my + 14);
      ctx.lineTo(mx + 33, my + 26);
      ctx.moveTo(mx + 33, my + 14);
      ctx.lineTo(mx + 27, my + 26);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(mx + 24, my + 20, 6, -0.9, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx + 24, my + 20, 10, -0.9, 0.9);
      ctx.stroke();
    }
  }
  if (battle.result && perkChoices) {
    ctx.fillStyle = 'rgba(8,10,14,0.96)';
    ctx.fillRect(PERK_PANEL.x, PERK_PANEL.y, PERK_PANEL.w, PERK_PANEL.h);
    ctx.strokeStyle = '#e8c95c';
    ctx.lineWidth = 2;
    ctx.strokeRect(PERK_PANEL.x, PERK_PANEL.y, PERK_PANEL.w, PERK_PANEL.h);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8c95c';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(t('perkTitle'), VIEW_W / 2, PERK_PANEL.y + 32);
    ctx.fillStyle = '#999';
    ctx.font = '13px monospace';
    ctx.fillText(t('perkHint'), VIEW_W / 2, PERK_PANEL.y + 52);
    for (let i = 0; i < perkChoices.length; i++) {
      const [x, y, w, h] = perkCardRect(i);
      ctx.fillStyle = '#14181f';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#5a6472';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#e8e6e0';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(perkName(perkChoices[i]), x + w / 2, y + 52);
      ctx.fillStyle = '#aab4c0';
      ctx.font = '13px monospace';
      ctx.fillText(perkDesc(perkChoices[i]), x + w / 2, y + 88);
    }
  }
  if (paused && !battle.result) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('paused'), VIEW_W / 2, VIEW_H / 2 - 40);
    drawPauseBtn(ctx, PAUSE_RESUME, t('pauseResume'));
    drawPauseBtn(ctx, PAUSE_MENU, t('pauseMenu'));
    ctx.fillStyle = '#8a8f98';
    ctx.font = '13px monospace';
    ctx.fillText(t('escResume'), VIEW_W / 2, VIEW_H / 2 + 145);
  }
}

new Loop(update, render).start();
