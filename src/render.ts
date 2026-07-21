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

function drawCliff(ctx: CanvasRenderingContext2D, side: 'player' | 'enemy', cam: Camera, hitFlash: number, time: number, flagColor: string, era: string) {
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

  // era-specific shore base
  const fortX = isPlayer ? baseX + 60 : baseX - 60;
  const fortDark = isPlayer ? '#24262b' : '#57201e';
  const f = sx(fortX);
  const coastSx = sx(coastX);
  const lx = (d: number) => f + dir * d; // local x, positive toward the sea
  let poleX = f;
  let poleTop = SEA_Y - 244;

  if (era === 'ww2') {
    // Atlantic-Wall concrete casemate with sloped roof toward the sea
    ctx.fillStyle = fortDark;
    ctx.beginPath();
    ctx.moveTo(lx(-38), SEA_Y - 56);
    ctx.lineTo(lx(-38), SEA_Y - 132);
    ctx.lineTo(lx(4), SEA_Y - 132);
    ctx.lineTo(lx(38), SEA_Y - 106);
    ctx.lineTo(lx(38), SEA_Y - 56);
    ctx.closePath();
    ctx.fill();
    // concrete shuttering lines
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1;
    for (let l = 0; l < 3; l++) {
      const ly = SEA_Y - 70 - l * 18;
      ctx.beginPath();
      ctx.moveTo(lx(-36), ly);
      ctx.lineTo(lx(36), ly);
      ctx.stroke();
    }
    // stepped embrasure facing the sea
    ctx.fillStyle = rockDark;
    ctx.fillRect(Math.min(lx(10), lx(34)), SEA_Y - 100, 24, 12);
    ctx.fillStyle = '#0d0e10';
    ctx.fillRect(Math.min(lx(15), lx(29)), SEA_Y - 97, 14, 6);
    // camouflage patches
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.ellipse(lx(-14), SEA_Y - 92, 14, 7, 0.4, 0, Math.PI * 2);
    ctx.ellipse(lx(12), SEA_Y - 68, 11, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // fire-control tower with rangefinder arms
    ctx.fillStyle = fortDark;
    ctx.fillRect(Math.min(lx(-30), lx(-10)), SEA_Y - 196, 20, 66);
    ctx.fillRect(Math.min(lx(-34), lx(-6)), SEA_Y - 208, 28, 14);
    ctx.fillStyle = rockDark;
    ctx.fillRect(Math.min(lx(-29), lx(-11)), SEA_Y - 204, 18, 4);
    ctx.fillStyle = fortDark;
    ctx.fillRect(Math.min(lx(-42), lx(2)), SEA_Y - 213, 44, 4);
    poleX = lx(-20);
    poleTop = SEA_Y - 250;
    // czech hedgehogs against landings
    ctx.strokeStyle = isPlayer ? '#2a2d33' : '#3e2321';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const hx = coastSx - dir * (16 + i * 15);
      ctx.beginPath();
      ctx.moveTo(hx - 6, SEA_Y + 2); ctx.lineTo(hx + 6, SEA_Y - 10);
      ctx.moveTo(hx - 6, SEA_Y - 10); ctx.lineTo(hx + 6, SEA_Y + 2);
      ctx.moveTo(hx, SEA_Y - 12); ctx.lineTo(hx, SEA_Y + 2);
      ctx.stroke();
    }
  } else if (era === 'modern') {
    // naval command block with glass bands
    ctx.fillStyle = fortDark;
    ctx.fillRect(f - 36, SEA_Y - 132, 72, 76);
    ctx.fillStyle = rockLight;
    ctx.fillRect(f - 36, SEA_Y - 132, 72, 2);
    ctx.fillStyle = 'rgba(140,180,200,0.35)';
    ctx.fillRect(f - 30, SEA_Y - 122, 60, 7);
    ctx.fillRect(f - 30, SEA_Y - 104, 60, 7);
    ctx.fillStyle = rockDark;
    ctx.fillRect(f - 8, SEA_Y - 80, 16, 24);
    // radome on the roof
    ctx.fillStyle = fortDark;
    ctx.fillRect(lx(-16) - 5, SEA_Y - 146, 10, 14);
    ctx.fillStyle = '#d8dcde';
    ctx.beginPath();
    ctx.arc(lx(-16), SEA_Y - 156, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,126,130,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(lx(-16), SEA_Y - 156, 12, -0.4, Math.PI * 0.6);
    ctx.stroke();
    // lattice comms mast with blinking beacon
    const mx = lx(18);
    ctx.strokeStyle = fortDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - 6, SEA_Y - 132); ctx.lineTo(mx, SEA_Y - 212);
    ctx.moveTo(mx + 6, SEA_Y - 132); ctx.lineTo(mx, SEA_Y - 212);
    for (let l = 0; l < 4; l++) {
      const ly = SEA_Y - 144 - l * 18;
      const hw = 5 - l;
      ctx.moveTo(mx - hw, ly); ctx.lineTo(mx + hw, ly);
    }
    ctx.stroke();
    ctx.fillStyle = fortDark;
    ctx.fillRect(mx - 10, SEA_Y - 200, 20, 3);
    if (Math.sin(time * 4) > 0) {
      ctx.fillStyle = '#ff5044';
      ctx.beginPath();
      ctx.arc(mx, SEA_Y - 214, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    poleX = lx(-34);
    poleTop = SEA_Y - 170;
    // tetrapod breakwater at the waterline
    ctx.strokeStyle = isPlayer ? '#43464c' : '#4a2a28';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const hx = coastSx - dir * (16 + i * 14);
      const hy = SEA_Y - 3 + (i % 2) * 3;
      ctx.beginPath();
      ctx.moveTo(hx, hy); ctx.lineTo(hx - 6, hy + 6);
      ctx.moveTo(hx, hy); ctx.lineTo(hx + 6, hy + 6);
      ctx.moveTo(hx, hy); ctx.lineTo(hx, hy - 8);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  } else {
    // WWI masonry coastal fort: brick bastion + crenellated tower
    ctx.fillStyle = fortDark;
    ctx.fillRect(f - 34, SEA_Y - 148, 68, 90);
    ctx.fillStyle = rockLight;
    ctx.fillRect(f - 34, SEA_Y - 148, 68, 2);
    // brick mortar courses
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1;
    for (let l = 0; l < 5; l++) {
      const ly = SEA_Y - 138 + l * 16;
      ctx.beginPath();
      ctx.moveTo(f - 34, ly);
      ctx.lineTo(f + 34, ly);
      for (let c = 0; c < 4; c++) {
        const bx = f - 27 + c * 17 + (l % 2) * 8;
        ctx.moveTo(bx, ly);
        ctx.lineTo(bx, ly + 16);
      }
      ctx.stroke();
    }
    // embrasure slits
    ctx.fillStyle = rockDark;
    ctx.fillRect(f - 22, SEA_Y - 132, 14, 5);
    ctx.fillRect(f + 8, SEA_Y - 132, 14, 5);
    // sandbag parapet on the bastion roof
    ctx.fillStyle = isPlayer ? '#3b3e44' : '#5a2f2c';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(f - 30 + i * 10, SEA_Y - 151, 5.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // crenellated observation tower
    ctx.fillStyle = fortDark;
    ctx.fillRect(f - 22, SEA_Y - 200, 44, 52);
    for (let m = -1; m <= 1; m++) {
      ctx.fillRect(f + m * 15 - 4, SEA_Y - 209, 9, 9);
    }
    ctx.fillStyle = rockDark;
    ctx.fillRect(f - 14, SEA_Y - 190, 28, 5);
    ctx.fillRect(f - 6, SEA_Y - 172, 12, 24);
    // barbed wire posts on the waterline rock
    ctx.strokeStyle = rockDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const px = coastSx - 20 + i * 8;
      ctx.moveTo(px, SEA_Y - 26);
      ctx.lineTo(px, SEA_Y - 35);
    }
    ctx.moveTo(coastSx - 22, SEA_Y - 33);
    ctx.lineTo(coastSx - 2, SEA_Y - 33);
    ctx.moveTo(coastSx - 22, SEA_Y - 29);
    ctx.lineTo(coastSx - 2, SEA_Y - 29);
    ctx.stroke();
    // sandbags at the waterline
    ctx.fillStyle = isPlayer ? '#33363b' : '#452725';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(coastSx - dir * (16 + i * 9), SEA_Y - 4, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // flag pole + waving flag
  ctx.fillStyle = fortDark;
  ctx.fillRect(poleX - 1.5, poleTop, 3, 36);
  const wave = Math.sin(time * 5) * 4;
  const tip = dir * 30;
  ctx.fillStyle = flagColor;
  ctx.beginPath();
  ctx.moveTo(poleX + 1.5 * dir, poleTop);
  ctx.quadraticCurveTo(poleX + tip * 0.6, poleTop + 4 + wave, poleX + tip, poleTop + 9 + wave);
  ctx.quadraticCurveTo(poleX + tip * 0.6, poleTop + 14 + wave, poleX + 1.5 * dir, poleTop + 18);
  ctx.closePath();
  ctx.fill();

  if (hitFlash > 0) {
    ctx.fillStyle = `rgba(255,80,60,${hitFlash * 2})`;
    ctx.fillRect(f - 44, SEA_Y - 216, 88, 160);
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
  drawCliff(ctx, 'player', cam, b.baseHitPlayer, b.time, b.nation.color, b.era.id);
  drawCliff(ctx, 'enemy', cam, b.baseHitEnemy, b.time, b.enemyNation.color, b.era.id);
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
