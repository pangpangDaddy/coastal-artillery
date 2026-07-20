import type { Battle } from './battle';
import type { Camera } from './core';
import { drawTurretSilhouette, drawUnitSilhouette } from './silhouettes';
import { turretSlotPos } from './entities';
import { ENEMY_COAST_X, PLAYER_COAST_X, SEA_Y, SUB_Y, VIEW_H, VIEW_W, WORLD_W } from './types';

const PLAYER_COLOR = '#181a1e';
const ENEMY_COLOR = '#a81f26';
const PLAYER_HP = '#2f6b2f';
const ENEMY_HP = '#c22a2a';

// deterministic pseudo-random from an index
function rnd(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function drawSky(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
  const g = ctx.createLinearGradient(0, 0, 0, SEA_Y);
  g.addColorStop(0, '#d4dadd');
  g.addColorStop(0.55, '#e6e4dc');
  g.addColorStop(1, '#f0e9d8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // sun with soft glow (far parallax)
  const sunX = WORLD_W * 0.52 - cam.x * 0.08;
  const sunY = 120;
  const glow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 150);
  glow.addColorStop(0, 'rgba(255,250,235,0.95)');
  glow.addColorStop(0.25, 'rgba(255,248,225,0.55)');
  glow.addColorStop(1, 'rgba(255,248,225,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 160, sunY - 160, 320, 320);
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
  ctx.fill();

  // far cloud band (slow parallax, gray silhouette streaks)
  ctx.fillStyle = 'rgba(190,192,190,0.5)';
  const offFar = -(cam.x * 0.18) % 520;
  for (let i = -1; i < 4; i++) {
    const bx = offFar + i * 520 + rnd(i, 1) * 120;
    const by = 70 + rnd(i, 2) * 90;
    ctx.fillRect(bx, by, 200 + rnd(i, 3) * 120, 7);
    ctx.fillRect(bx + 50, by + 14, 130 + rnd(i, 4) * 80, 5);
  }

  // near puffy clouds (faster parallax)
  const offNear = -(cam.x * 0.4 + time * 3) % 640;
  for (let i = -1; i < 4; i++) {
    const cx = offNear + i * 640 + rnd(i, 5) * 160;
    const cy = 100 + rnd(i, 6) * 150;
    const s = 0.7 + rnd(i, 7) * 0.7;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 46 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 30 * s, cy + 5 * s, 26 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 32 * s, cy + 5 * s, 28 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,202,200,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8 * s, 44 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // distant birds
  ctx.strokeStyle = 'rgba(70,72,76,0.6)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const bx = ((rnd(i, 8) * 1400 + time * (14 + i * 3) - cam.x * 0.5) % (VIEW_W + 120)) - 60;
    const by = 90 + rnd(i, 9) * 130 + Math.sin(time * 2 + i * 2.2) * 6;
    const w = 5 + rnd(i, 10) * 4;
    const flap = Math.sin(time * 6 + i * 1.7) * 2.5;
    ctx.beginPath();
    ctx.moveTo(bx - w, by - flap);
    ctx.quadraticCurveTo(bx - w / 2, by + 2, bx, by);
    ctx.quadraticCurveTo(bx + w / 2, by + 2, bx + w, by - flap);
    ctx.stroke();
  }
}

function drawHorizon(ctx: CanvasRenderingContext2D, cam: Camera) {
  // distant mountains / enemy shoreline silhouette on the horizon
  ctx.fillStyle = 'rgba(140,144,148,0.45)';
  const off = -(cam.x * 0.12) % 900;
  ctx.beginPath();
  ctx.moveTo(-100, SEA_Y);
  for (let i = -1; i < 3; i++) {
    const bx = off + i * 900;
    ctx.lineTo(bx + 120, SEA_Y - 26 - rnd(i, 11) * 20);
    ctx.lineTo(bx + 260, SEA_Y - 8);
    ctx.lineTo(bx + 420, SEA_Y - 40 - rnd(i, 12) * 26);
    ctx.lineTo(bx + 600, SEA_Y - 6);
    ctx.lineTo(bx + 780, SEA_Y - 20 - rnd(i, 13) * 16);
  }
  ctx.lineTo(VIEW_W + 100, SEA_Y);
  ctx.closePath();
  ctx.fill();

  // tiny distant ships on the horizon
  ctx.fillStyle = 'rgba(120,124,128,0.5)';
  for (let i = 0; i < 3; i++) {
    const bx = ((rnd(i, 14) * 2200) - cam.x * 0.15) % (VIEW_W + 200);
    const x = bx < -100 ? bx + VIEW_W + 200 : bx;
    ctx.fillRect(x, SEA_Y - 7, 26, 5);
    ctx.fillRect(x + 8, SEA_Y - 12, 5, 5);
  }
}

function drawSea(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
  const g = ctx.createLinearGradient(0, SEA_Y, 0, VIEW_H);
  g.addColorStop(0, '#c3c8c6');
  g.addColorStop(0.25, '#a9aeac');
  g.addColorStop(0.7, '#848a87');
  g.addColorStop(1, '#6b7171');
  ctx.fillStyle = g;
  ctx.fillRect(0, SEA_Y, VIEW_W, VIEW_H - SEA_Y);

  // horizon highlight
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(0, SEA_Y - 1, VIEW_W, 2);

  // rolling wave layers (sine bands, parallax + drift)
  const layers = [
    { amp: 3, len: 90, speed: 14, y: SEA_Y + 14, alpha: 0.35, par: 0.7 },
    { amp: 4, len: 130, speed: 10, y: SEA_Y + 42, alpha: 0.28, par: 0.85 },
    { amp: 5, len: 180, speed: 7, y: SEA_Y + 86, alpha: 0.22, par: 1.0 },
  ];
  for (const L of layers) {
    ctx.strokeStyle = `rgba(255,255,255,${L.alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = -20; x <= VIEW_W + 20; x += 8) {
      const wx = x + cam.x * L.par;
      const y = L.y + Math.sin(wx / L.len * Math.PI * 2 + time * L.speed * 0.12) * L.amp;
      if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // glitter dashes
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 14; i++) {
    const y = SEA_Y + 10 + i * 11;
    const off = ((time * 14 + i * 67) % 170) - (cam.x % 170);
    ctx.beginPath();
    for (let x = -170; x < VIEW_W + 170; x += 170) {
      const len = 26 + rnd(i, x & 15) * 30;
      ctx.moveTo(x + off, y);
      ctx.lineTo(x + off + len, y);
    }
    ctx.stroke();
  }
}

function drawCoastFoam(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
  // surf foaming against both coast rocks
  for (const coastX of [PLAYER_COAST_X, ENEMY_COAST_X]) {
    const sx = coastX - cam.x;
    if (sx < -80 || sx > VIEW_W + 80) continue;
    for (let i = 0; i < 6; i++) {
      const phase = (time * 1.6 + i * 0.7) % 2;
      const r = 6 + phase * 12;
      const alpha = Math.max(0, 0.4 - phase * 0.2);
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(sx + 6 + i * 7, SEA_Y + 4 + (i % 2) * 5, r, r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawCliff(ctx: CanvasRenderingContext2D, side: 'player' | 'enemy', cam: Camera, hitFlash: number, time: number) {
  const isPlayer = side === 'player';
  const baseX = isPlayer ? 0 : WORLD_W;
  const dir = isPlayer ? 1 : -1;
  const sx = (wx: number) => wx - cam.x;
  const rock = isPlayer ? '#3a3d42' : '#4a2a28';
  const rockDark = isPlayer ? '#2c2f34' : '#3a201e';
  const rockLight = isPlayer ? '#4a4e55' : '#5c3633';

  // stepped cliff face with jagged top edges: [edgeX, topY]
  const steps: [number, number][] = [
    [26, SEA_Y - 130],
    [70, SEA_Y - 100],
    [120, SEA_Y - 70],
    [170, SEA_Y - 40],
  ];
  let prev = 0;
  for (let s = 0; s < steps.length; s++) {
    const [edgeX, topY] = steps[s];
    const w0 = baseX + dir * prev;
    const w1 = baseX + dir * edgeX;
    const x0 = Math.min(w0, w1);
    const wpx = Math.abs(w1 - w0) + 1;
    // body
    ctx.fillStyle = rock;
    ctx.fillRect(sx(x0), topY, wpx, VIEW_H - topY);
    // jagged top edge
    ctx.beginPath();
    ctx.moveTo(sx(x0), topY + 8);
    const segs = Math.max(3, Math.floor(wpx / 14));
    for (let j = 0; j <= segs; j++) {
      const jx = x0 + (wpx * j) / segs;
      const jy = topY + rnd(s * 37 + j, isPlayer ? 21 : 22) * 7 - 3;
      ctx.lineTo(sx(jx), jy);
    }
    ctx.lineTo(sx(x0 + wpx), topY + 8);
    ctx.closePath();
    ctx.fill();
    // sunlit rim along the step top
    ctx.strokeStyle = rockLight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx(x0), topY + 1);
    ctx.lineTo(sx(x0 + wpx), topY + 1);
    ctx.stroke();
    // rock strata lines
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 2;
    for (let l = 0; l < 3; l++) {
      const ly = topY + 26 + l * 42 + rnd(s * 11 + l, 23) * 10;
      ctx.beginPath();
      ctx.moveTo(sx(x0), ly);
      ctx.lineTo(sx(x0 + wpx), ly + rnd(s * 13 + l, 24) * 6 - 3);
      ctx.stroke();
    }
    prev = edgeX;
  }

  // coast waterline rock with highlight
  const coastX = isPlayer ? PLAYER_COAST_X : ENEMY_COAST_X;
  ctx.fillStyle = isPlayer ? '#2f3237' : '#3e2321';
  ctx.fillRect(sx(coastX) - 26, SEA_Y - 26, 30, 40);
  ctx.fillStyle = rockLight;
  ctx.fillRect(sx(coastX) - 26, SEA_Y - 26, 30, 3);

  // base fort with battlements
  const fortX = isPlayer ? baseX + 60 : baseX - 60;
  ctx.fillStyle = isPlayer ? '#24262b' : '#57201e';
  ctx.fillRect(sx(fortX) - 26, SEA_Y - 192, 52, 68);
  // merlons
  for (let m = -2; m <= 2; m++) {
    ctx.fillRect(sx(fortX) + m * 11 - 4, SEA_Y - 202, 8, 10);
  }
  // gate + slits
  ctx.fillStyle = rockDark;
  ctx.fillRect(sx(fortX) - 7, SEA_Y - 152, 14, 28);
  ctx.fillRect(sx(fortX) - 16, SEA_Y - 178, 4, 12);
  ctx.fillRect(sx(fortX) + 12, SEA_Y - 178, 4, 12);
  // flag pole + waving flag
  ctx.fillStyle = isPlayer ? '#24262b' : '#57201e';
  ctx.fillRect(sx(fortX) - 2, SEA_Y - 240, 4, 40);
  const wave = Math.sin(time * 5) * 4;
  const tip = isPlayer ? 30 : -30;
  ctx.fillStyle = isPlayer ? PLAYER_COLOR : ENEMY_COLOR;
  ctx.beginPath();
  ctx.moveTo(sx(fortX) + 2, SEA_Y - 240);
  ctx.quadraticCurveTo(sx(fortX) + tip * 0.6, SEA_Y - 236 + wave, sx(fortX) + tip, SEA_Y - 231 + wave);
  ctx.quadraticCurveTo(sx(fortX) + tip * 0.6, SEA_Y - 226 + wave, sx(fortX) + 2, SEA_Y - 222);
  ctx.closePath();
  ctx.fill();
  // sandbags at waterline
  ctx.fillStyle = isPlayer ? '#33363b' : '#452725';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(sx(coastX) - 44 + i * 9, SEA_Y - 4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (hitFlash > 0) {
    ctx.fillStyle = `rgba(255,80,60,${hitFlash * 2})`;
    ctx.fillRect(sx(fortX) - 30, SEA_Y - 206, 60, 88);
  }
}

function drawTurretSlots(ctx: CanvasRenderingContext2D, b: Battle, cam: Camera) {
  ctx.setLineDash([5, 4]);
  const taken = b.playerTurretSlotsTaken();
  for (let s = 0; s < 4; s++) {
    if (taken.has(s)) continue;
    const [x, y] = turretSlotPos('player', s);
    const sx = x - cam.x;
    if (sx < -40 || sx > VIEW_W + 40) continue;
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fillRect(sx - 16, y - 18, 32, 18);
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 16, y - 18, 32, 18);
  }
  ctx.setLineDash([]);
}

function drawHpBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, ratio: number, color: string) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x - w / 2, y, w, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y, w * Math.max(0, ratio), 4);
}

export function renderBattle(ctx: CanvasRenderingContext2D, b: Battle, cam: Camera) {
  ctx.save();
  ctx.translate(-cam.shakeX, -cam.shakeY);
  drawSky(ctx, cam, b.time);
  drawHorizon(ctx, cam);
  drawSea(ctx, cam, b.time);
  drawCoastFoam(ctx, cam, b.time);
  drawCliff(ctx, 'player', cam, b.baseHitPlayer, b.time);
  drawCliff(ctx, 'enemy', cam, b.baseHitEnemy, b.time);
  drawTurretSlots(ctx, b, cam);

  // sub layer hint (water darken below sub depth)
  ctx.fillStyle = 'rgba(20,30,40,0.16)';
  ctx.fillRect(0, SUB_Y + 6, VIEW_W, VIEW_H - SUB_Y);

  // turrets
  for (const t of b.turrets) {
    const sx = t.x - cam.x;
    if (sx < -80 || sx > VIEW_W + 80) continue;
    const color = t.flash > 0 ? '#fff' : t.side === 'player' ? PLAYER_COLOR : ENEMY_COLOR;
    drawTurretSilhouette(ctx, t.def.silhouette, sx, t.y, 1, t.side === 'player' ? 1 : -1, color, t.aimAngle);
    drawHpBar(ctx, sx, t.y - 34, 34, t.hp / t.maxHp, t.side === 'player' ? PLAYER_HP : ENEMY_HP);
  }

  // units
  for (const u of b.units) {
    const sx = u.x - cam.x;
    if (sx < -140 || sx > VIEW_W + 140) continue;
    const sideDir = u.side === 'player' ? 1 : -1;
    const facing: 1 | -1 = u.def.layer === 'air' && u.vx !== 0 ? (u.vx > 0 ? 1 : -1) : sideDir;
    let color = u.side === 'player' ? PLAYER_COLOR : ENEMY_COLOR;
    if (u.def.layer === 'sub') color = u.side === 'player' ? 'rgba(24,26,30,0.75)' : 'rgba(168,31,38,0.75)';
    if (u.flash > 0) color = '#fff';
    drawUnitSilhouette(ctx, u.def.silhouette, u.def.layer, sx, u.y, u.def.size, facing, color);
    const bw = 30 + u.def.size * 22;
    drawHpBar(ctx, sx, u.y - (u.def.layer === 'air' ? 26 : 34) * u.def.size - 8, bw, u.hp / u.maxHp, u.side === 'player' ? PLAYER_HP : ENEMY_HP);
    if (u.def.boss) {
      ctx.fillStyle = ENEMY_HP;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FLAGSHIP', sx, u.y - 34 * u.def.size - 16);
    }
  }

  // projectiles
  for (const p of b.projectiles) {
    const sx = p.x - cam.x;
    if (sx < -40 || sx > VIEW_W + 40) continue;
    if (p.kind === 'bullet') {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(sx - 2, p.y - 1, 4, 2);
    } else if (p.kind === 'shell') {
      ctx.fillStyle = '#141414';
      ctx.beginPath();
      ctx.arc(sx, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'torpedo') {
      ctx.fillStyle = '#20242a';
      ctx.fillRect(sx - 6, p.y - 1.5, 12, 3);
    } else if (p.kind === 'missile') {
      ctx.save();
      ctx.translate(sx, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.fillStyle = '#222';
      ctx.fillRect(-6, -2, 12, 4);
      ctx.restore();
    } else if (p.kind === 'bomb') {
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(sx, p.y, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#333';
      ctx.fillRect(sx - 3, p.y - 3, 6, 6);
    }
  }

  b.effects.render(ctx);
  ctx.restore();
}
