import { Battle } from './battle';
import { Camera, Input, Loop } from './core';
import { STAGES, nextStageId } from './data';
import { Hud } from './hud';
import { Menu, saveUnlocked } from './menus';
import { renderBattle } from './render';
import { VIEW_H, VIEW_W } from './types';

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

function startStage(stageId: string) {
  battle = new Battle(stageId);
  camera = new Camera();
  hud = new Hud();
  camera.x = 0;
  mode = 'battle';
}

function backToMenu() {
  mode = 'menu';
  menu = new Menu(unlockAll);
  battle = null;
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

  if (input.pressed('Escape')) paused = !paused;

  if (battle.result) {
    if (input.pressed('Enter') || input.pressed('NumpadEnter')) {
      if (battle.result === 'win') {
        const idx = STAGES.findIndex(s => s.id === battle!.stage.id);
        saveUnlocked(idx + 1);
        const next = nextStageId(battle.stage.id);
        if (next) startStage(next); else backToMenu();
      } else {
        startStage(battle.stage.id);
      }
      input.keys.delete('Enter');
    }
    return;
  }

  if (!paused) {
    camera.update(dt, input, battle.effects.shake);
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
  if (paused && !battle.result) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#e8e6e0';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2);
    ctx.font = '15px monospace';
    ctx.fillText('ESC to resume', VIEW_W / 2, VIEW_H / 2 + 36);
  }
}

new Loop(update, render).start();
