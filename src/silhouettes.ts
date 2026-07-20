type Ctx = CanvasRenderingContext2D;

function poly(ctx: Ctx, pts: number[][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillRect(x, y, w, h);
}

function barrel(ctx: Ctx, x: number, y: number, len: number, angle: number, w = 2.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillRect(0, -w / 2, len, w);
  ctx.restore();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// All ships drawn facing +x, waterline at y=0, length ~ 100 * size
const SHIPS: Record<string, (ctx: Ctx) => void> = {
  gunboat(ctx) {
    poly(ctx, [[-40, -8], [44, -8], [52, -2], [46, 6], [-34, 6]]);
    rect(ctx, -14, -18, 22, 10);
    rect(ctx, 2, -26, 4, 8);
    barrel(ctx, 14, -14, 22, -0.12);
  },
  cruiser(ctx) {
    poly(ctx, [[-50, -10], [52, -10], [62, -3], [54, 7], [-42, 7]]);
    rect(ctx, -20, -22, 16, 12);
    rect(ctx, 4, -22, 16, 12);
    rect(ctx, -8, -32, 4, 10);
    rect(ctx, 14, -32, 4, 10);
    barrel(ctx, 30, -14, 26, -0.1);
    barrel(ctx, -34, -14, 24, Math.PI + 0.1);
  },
  dreadnought(ctx) {
    poly(ctx, [[-52, -12], [54, -12], [66, -4], [56, 8], [-44, 8]]);
    rect(ctx, -12, -26, 24, 14);
    rect(ctx, -4, -40, 5, 14);
    rect(ctx, 10, -36, 4, 10);
    rect(ctx, -30, -20, 10, 8);
    rect(ctx, 22, -20, 10, 8);
    barrel(ctx, 28, -22, 30, -0.08);
    barrel(ctx, -24, -22, 28, Math.PI + 0.08);
    barrel(ctx, 32, -14, 26, -0.06);
  },
  destroyer(ctx) {
    poly(ctx, [[-48, -9], [50, -9], [60, -3], [52, 6], [-40, 6]]);
    rect(ctx, -18, -20, 18, 11);
    rect(ctx, 6, -20, 12, 11);
    rect(ctx, -4, -30, 4, 10);
    barrel(ctx, 24, -13, 26, -0.1);
  },
  carrier(ctx) {
    poly(ctx, [[-56, -10], [58, -10], [64, -4], [56, 6], [-50, 6]]);
    rect(ctx, -60, -16, 122, 6);
    rect(ctx, 16, -34, 14, 18);
    rect(ctx, 20, -40, 6, 6);
  },
  lcs(ctx) {
    poly(ctx, [[-46, -8], [48, -8], [58, -2], [50, 5], [-38, 5]]);
    poly(ctx, [[-16, -8], [10, -8], [18, -22], [-8, -22]]);
    barrel(ctx, 22, -12, 24, -0.1);
  },
  missile_destroyer(ctx) {
    poly(ctx, [[-52, -10], [54, -10], [64, -3], [56, 7], [-44, 7]]);
    rect(ctx, -26, -20, 18, 10);
    rect(ctx, -2, -24, 20, 14);
    rect(ctx, 4, -38, 4, 14);
    rect(ctx, 24, -18, 14, 8);
    barrel(ctx, 40, -13, 24, -0.08);
  },
  aegis(ctx) {
    poly(ctx, [[-54, -11], [56, -11], [66, -4], [58, 7], [-46, 7]]);
    rect(ctx, -30, -22, 20, 11);
    poly(ctx, [[-4, -11], [22, -11], [26, -30], [0, -30]]);
    rect(ctx, 8, -44, 4, 14);
    rect(ctx, 28, -19, 12, 8);
    barrel(ctx, 42, -14, 24, -0.08);
  },
  uboat(ctx) {
    ellipse(ctx, 0, -4, 42, 8);
    rect(ctx, -6, -18, 14, 12);
    rect(ctx, -2, -24, 3, 6);
  },
  nuke_sub(ctx) {
    ellipse(ctx, 0, -4, 52, 9);
    rect(ctx, -12, -20, 16, 13);
    poly(ctx, [[-52, -4], [-62, -10], [-62, 2]]);
  },
};

// Air units drawn facing +x, center at origin
const AIR: Record<string, (ctx: Ctx) => void> = {
  biplane(ctx) {
    rect(ctx, -22, -10, 40, 3);
    rect(ctx, -20, 0, 38, 3);
    ellipse(ctx, 0, -3, 16, 4);
    poly(ctx, [[-20, -3], [-30, -10], [-30, 2]]);
    rect(ctx, 16, -4, 6, 3);
  },
  zeppelin(ctx) {
    ellipse(ctx, 0, 0, 56, 13);
    poly(ctx, [[-48, 0], [-64, -10], [-60, 0], [-64, 10]]);
    rect(ctx, -10, 13, 18, 6);
  },
  fighter(ctx) {
    poly(ctx, [[24, 0], [-6, -4], [-18, -14], [-14, -3], [-24, -3], [-24, 3], [-14, 3], [-18, 14], [-6, 4]]);
    poly(ctx, [[-20, -3], [-30, -10], [-26, 0], [-30, 8]]);
  },
  bomber(ctx) {
    ellipse(ctx, 0, 0, 24, 5);
    poly(ctx, [[4, -2], [-10, -22], [-14, -22], [-4, -2]]);
    poly(ctx, [[4, 2], [-10, 22], [-14, 22], [-4, 2]]);
    poly(ctx, [[-22, 0], [-32, -8], [-30, 0], [-32, 8]]);
  },
  jet(ctx) {
    poly(ctx, [[28, 0], [2, -3], [-12, -16], [-16, -16], [-6, -2], [-20, -2], [-14, 0], [-20, 2], [-6, 2], [-16, 16], [-12, 16], [2, 3]]);
    poly(ctx, [[-18, 0], [-26, -8], [-24, 0], [-26, 8]]);
  },
  uav(ctx) {
    ellipse(ctx, 0, 0, 18, 3.5);
    poly(ctx, [[2, -2], [-12, -18], [-8, -18], [8, -2]]);
    poly(ctx, [[-16, 0], [-24, -10], [-22, 0], [-24, 6]]);
    ellipse(ctx, 8, 4, 3, 3);
  },
};

// Turrets: drawn on cliff, barrel pivot at (0, -10)
const TURRETS: Record<string, (ctx: Ctx, aim: number) => void> = {
  turret_gun(ctx, aim) {
    poly(ctx, [[-22, 0], [22, 0], [16, -16], [-16, -16]]);
    rect(ctx, -10, -22, 20, 6);
    barrel(ctx, 0, -18, 34, aim, 4);
  },
  turret_aa(ctx, aim) {
    poly(ctx, [[-16, 0], [16, 0], [12, -10], [-12, -10]]);
    barrel(ctx, -4, -10, 26, aim - 0.06, 3);
    barrel(ctx, 4, -10, 26, aim + 0.06, 3);
  },
  turret_missile(ctx, aim) {
    rect(ctx, -20, -14, 40, 14);
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(aim);
    for (let i = 0; i < 4; i++) rect(ctx, 0, -14 + i * 8, 26, 6);
    ctx.restore();
  },
  turret_ciws(ctx, aim) {
    poly(ctx, [[-14, 0], [14, 0], [10, -12], [-10, -12]]);
    ellipse(ctx, 0, -14, 8, 7);
    barrel(ctx, 4, -14, 24, aim, 3);
  },
};

export function drawUnitSilhouette(ctx: Ctx, key: string, layer: string, x: number, y: number, size: number, facing: 1 | -1, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = layer === 'air' ? AIR[key] : SHIPS[key];
  if (fn) fn(ctx); else { rect(ctx, -30, -12, 60, 12); }
  ctx.restore();
}

export function drawTurretSilhouette(ctx: Ctx, key: string, x: number, y: number, size: number, facing: 1 | -1, color: string, aimAngle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = TURRETS[key];
  if (fn) fn(ctx, facing === 1 ? aimAngle : Math.PI - aimAngle);
  ctx.restore();
}

export function drawTurretIcon(ctx: Ctx, key: string, x: number, y: number, size: number, color: string) {
  drawTurretSilhouette(ctx, key, x, y, size, 1, color, -0.5);
}
