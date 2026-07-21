import type { Battle } from './battle';
import { lvlMult } from './armory';
import { UNITS, WEAPONS, TURRETS } from './data';
import { perkBountyMult } from './perks';
import {
  ENEMY_COAST_X, Layer, PLAYER_COAST_X, Projectile, SEA_Y, Side, SUB_Y,
  Turret, Unit, WeaponDef, WORLD_W,
} from './types';

let nextUid = 1;

export function turretSlotPos(side: Side, slot: number): [number, number] {
  const xs = [145, 95, 43, 13];
  const ys = [SEA_Y - 40, SEA_Y - 70, SEA_Y - 100, SEA_Y - 130];
  const x = side === 'player' ? xs[slot] : WORLD_W - xs[slot];
  return [x, ys[slot]];
}

export function spawnUnit(b: Battle, defId: string, side: Side): Unit {
  const def = UNITS[defId];
  const dir = side === 'player' ? 1 : -1;
  const x = side === 'player' ? PLAYER_COAST_X - 20 : ENEMY_COAST_X + 20;
  // spread same-layer units across depth lanes so they advance in parallel columns
  const laneCounts = [0, 0, 0];
  for (const o of b.units) {
    if (!o.dead && o.side === side && o.def.layer === def.layer && o.lane >= 0) laneCounts[o.lane]++;
  }
  let lane = 0;
  if (laneCounts[1] < laneCounts[lane]) lane = 1;
  if (laneCounts[2] < laneCounts[lane]) lane = 2;
  const y = def.layer === 'sea' ? SEA_Y + lane * 16 : def.layer === 'sub' ? SUB_Y + lane * 10 : (def.altitude ?? 150);
  const hp = side === 'enemy' ? Math.round(def.hp * b.enemyNation.hp) : def.hp;
  const u: Unit = {
    uid: nextUid++, def, side, x, y,
    hp, maxHp: hp,
    reloads: def.weapons.map(w => WEAPONS[w].reload * (0.5 + Math.random() * 0.5)),
    carrierTimer: def.carrier ? def.carrier.interval * 0.5 : 0,
    launched: [], dead: false, flash: 0, vx: def.speed * dir, divePhase: 'cruise',
    lane: def.layer === 'air' ? 0 : lane, aim: -0.1,
  };
  b.units.push(u);
  return u;
}

export function spawnTurret(b: Battle, defId: string, side: Side, slot: number): Turret {
  const def = TURRETS[defId];
  const [x, y] = turretSlotPos(side, slot);
  const hp = side === 'enemy' ? Math.round(def.hp * b.enemyNation.hp) : def.hp;
  const t: Turret = {
    uid: nextUid++, def, side, slot, x, y,
    hp, maxHp: hp,
    reloads: def.weapons.map(() => 0), aimAngle: 0, dead: false, flash: 0,
  };
  b.turrets.push(t);
  return t;
}

interface TargetInfo {
  kind: 'unit' | 'turret' | 'base';
  uid: number;
  x: number;
  y: number;
  layer: Layer;
  vx: number;
}

function baseTarget(side: Side): TargetInfo {
  const x = side === 'player' ? ENEMY_COAST_X : PLAYER_COAST_X;
  return { kind: 'base', uid: 0, x, y: SEA_Y - 40, layer: 'sea', vx: 0 };
}

function gatherTargets(b: Battle, attackerSide: Side, layers: Layer[]): TargetInfo[] {
  const out: TargetInfo[] = [];
  for (const u of b.units) {
    if (u.dead || u.side === attackerSide) continue;
    if (!layers.includes(u.def.layer)) continue;
    out.push({ kind: 'unit', uid: u.uid, x: u.x, y: u.y, layer: u.def.layer, vx: u.vx });
  }
  if (layers.includes('sea')) {
    for (const t of b.turrets) {
      if (t.dead || t.side === attackerSide) continue;
      out.push({ kind: 'turret', uid: t.uid, x: t.x, y: t.y, layer: 'sea', vx: 0 });
    }
  }
  return out;
}

function pickTarget(b: Battle, side: Side, x: number, weapon: WeaponDef): TargetInfo | null {
  let best: TargetInfo | null = null;
  let bestD = Infinity;
  for (const t of gatherTargets(b, side, weapon.targets)) {
    const d = Math.abs(t.x - x);
    if (d <= weapon.range && d < bestD) { bestD = d; best = t; }
  }
  if (best) return best;
  // fall back to base if it is in range and weapon can hit sea layer
  if (weapon.targets.includes('sea')) {
    const base = baseTarget(side);
    if (Math.abs(base.x - x) <= weapon.range) return base;
  }
  return null;
}

function findTargetByUid(b: Battle, uid: number, side: Side): TargetInfo | null {
  for (const u of b.units) if (u.uid === uid && !u.dead) return { kind: 'unit', uid, x: u.x, y: u.y, layer: u.def.layer, vx: u.vx };
  for (const t of b.turrets) if (t.uid === uid && !t.dead) return { kind: 'turret', uid, x: t.x, y: t.y, layer: 'sea', vx: 0 };
  if (uid === 0) return baseTarget(side);
  return null;
}

function fire(b: Battle, side: Side, ox: number, oy: number, weapon: WeaponDef, target: TargetInfo, dmgBonus = 1, vel?: { vx: number; vy: number }) {
  const dir = side === 'player' ? 1 : -1;
  const tof = Math.abs(target.x - ox) / weapon.projSpeed || 0.3;
  const aimX = target.x + target.vx * tof * 0.8;
  const aimY = target.y;
  const p: Projectile = {
    kind: weapon.kind, side, x: ox, y: oy,
    vx: 0, vy: 0,
    damage: weapon.damage * (side === 'player' ? b.dmgMult() * dmgBonus : b.enemyNation.dmg), splash: weapon.splash ?? 0,
    targets: weapon.targets, targetUid: target.uid,
    life: 6, vsBaseMult: weapon.vsBaseMult ?? 1, dead: false,
  };
  switch (weapon.kind) {
    case 'shell': {
      const g = 230;
      const s = weapon.projSpeed;
      const X = Math.abs(aimX - ox);
      const Y = aimY - oy;
      if (X > 1) {
        const a = (g * X * X) / (2 * s * s);
        const disc = X * X - 4 * a * (a - Y);
        const u = disc >= 0 ? (-X + Math.sqrt(disc)) / (2 * a) : -1;
        const inv = 1 / Math.sqrt(1 + u * u);
        p.vx = Math.sign(aimX - ox) * s * inv;
        p.vy = s * u * inv;
      } else { p.vx = 0; p.vy = -s; }
      b.effects.muzzle(ox, oy);
      if (weapon.damage >= 90) b.sound.bigGun(); else b.sound.fire(weapon.damage > 50);
      break;
    }
    case 'bullet': {
      // two-step intercept lead against constant-velocity targets (aircraft)
      const rx = target.x - ox, ry = target.y - oy;
      let lead = Math.hypot(rx, ry) / weapon.projSpeed;
      lead = Math.hypot(rx + target.vx * lead, ry) / weapon.projSpeed;
      const dx = target.x + target.vx * lead - ox, dy = aimY - oy;
      const d = Math.max(1, Math.hypot(dx, dy));
      p.vx = (dx / d) * weapon.projSpeed;
      p.vy = (dy / d) * weapon.projSpeed;
      b.effects.tracer(ox, oy, ox + (dx / d) * 40, oy + (dy / d) * 40);
      b.sound.mg();
      break;
    }
    case 'torpedo': {
      if (oy < SEA_Y - 20) {
        p.y = oy;
        p.vx = dir * 30; // air-dropped falls first
      } else {
        p.y = oy > SEA_Y ? oy : SEA_Y + 8; // sub-launched torpedoes run at launch depth
        p.vx = 0;
      }
      p.vy = 0;
      b.sound.splash();
      break;
    }
    case 'missile': {
      p.vx = dir * weapon.projSpeed * 0.3;
      p.vy = -weapon.projSpeed * 0.55;
      b.sound.launch();
      break;
    }
    case 'bomb': {
      p.vx = vel ? vel.vx : dir * 20;
      p.vy = vel ? vel.vy : 0;
      break;
    }
    case 'depthcharge': {
      p.vx = (aimX - ox) * 0.8;
      p.vy = 0;
      break;
    }
  }
  b.projectiles.push(p);
}

function applyDamage(b: Battle, p: Projectile, ex: number, ey: number, hitBase = false) {
  const radius = p.splash + 16;
  let hit = false;
  for (const u of b.units) {
    if (u.dead || u.side === p.side || !p.targets.includes(u.def.layer)) continue;
    const d = Math.hypot(u.x - ex, u.y - ey);
    if (d < radius + u.def.size * 26) {
      u.hp -= p.damage;
      u.flash = 0.1;
      hit = true;
      if (u.hp <= 0 && !u.dead) {
        u.dead = true;
        b.effects.explosion(u.x, u.y - 8, u.def.size * (u.def.boss ? 2 : 1));
        if (u.def.layer === 'sea') b.effects.waterSplash(u.x, 2);
        b.sound.explosion(u.def.boss || u.def.size > 1.2);
        if (p.side === 'player') {
          b.resource += Math.round(u.def.bounty * perkBountyMult());
          b.score += u.def.bounty;
        }
      }
    }
  }
  for (const t of b.turrets) {
    if (t.dead || t.side === p.side || !p.targets.includes('sea')) continue;
    const d = Math.hypot(t.x - ex, t.y - ey);
    if (d < radius + 20) {
      t.hp -= p.damage;
      t.flash = 0.1;
      hit = true;
      if (t.hp <= 0 && !t.dead) {
        t.dead = true;
        b.effects.explosion(t.x, t.y - 10, 1.4);
        b.sound.explosion(true);
        if (p.side === 'player') { b.resource += 80; b.score += 80; }
      }
    }
  }
  // base damage only when the base was the intended target and the round landed near the coast
  const coastX = p.side === 'player' ? ENEMY_COAST_X : PLAYER_COAST_X;
  if (hitBase || (p.targetUid === 0 && Math.abs(ex - coastX) < 80)) {
    if (p.side === 'player') {
      b.enemyBaseHp -= p.damage * p.vsBaseMult;
      b.baseHitEnemy = 0.2;
    } else {
      b.playerBaseHp -= p.damage * p.vsBaseMult;
      b.baseHitPlayer = 0.2;
      b.sound.alarm();
    }
    hit = true;
  }
  if (hit || p.splash > 0) {
    b.effects.explosion(ex, ey, 0.5 + p.splash / 40);
    if (ey >= SEA_Y - 14 && p.targets.includes('sea')) b.effects.waterSplash(ex, 1);
    b.sound.explosion(false);
  }
}

export function updateProjectiles(b: Battle, dt: number) {
  for (const p of b.projectiles) {
    if (p.dead) continue;
    p.life -= dt;
    if (p.life <= 0) { p.dead = true; continue; }
    const target = findTargetByUid(b, p.targetUid, p.side);
    switch (p.kind) {
      case 'shell': {
        p.vy += 230 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (target && target.kind !== 'base' && Math.hypot(target.x - p.x, target.y - p.y) < 18) {
          applyDamage(b, p, p.x, p.y); p.dead = true;
        } else if (p.y >= SEA_Y - 4 && p.vy > 0) {
          applyDamage(b, p, p.x, SEA_Y - 6); p.dead = true;
        } else if (target?.kind === 'base' && Math.abs(p.x - target.x) < 26 && p.y > target.y - 60) {
          applyDamage(b, p, p.x, p.y); p.dead = true;
        }
        break;
      }
      case 'bullet': {
        const px0 = p.x, py0 = p.y;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (target) {
          // swept collision: closest approach along this frame's travel segment
          const sx = p.x - px0, sy = p.y - py0;
          const len2 = sx * sx + sy * sy || 1;
          const tt = Math.max(0, Math.min(1, ((target.x - px0) * sx + (target.y - py0) * sy) / len2));
          const cx = px0 + sx * tt, cy = py0 + sy * tt;
          if (Math.hypot(target.x - cx, target.y - cy) < 18) {
            applyDamage(b, p, cx, cy); p.dead = true;
          }
        }
        break;
      }
      case 'torpedo': {
        if (p.y < SEA_Y - 2) {
          p.vy += 320 * dt;
          p.y += p.vy * dt;
          p.x += p.vx * dt;
          if (p.y >= SEA_Y) { p.y = SEA_Y + 8; b.effects.waterSplash(p.x, 1.4); }
        } else {
          const dir = p.side === 'player' ? 1 : -1;
          p.x += dir * 190 * dt;
          // dive or climb toward the target's running depth so subs can actually be hit
          const wantY = target && target.kind === 'unit' && target.layer === 'sub' ? target.y : SEA_Y + 8;
          const dy = wantY - p.y;
          p.y += Math.max(-90 * dt, Math.min(90 * dt, dy));
          if (Math.random() < 0.3) b.effects.wakeTrail(p.x - dir * 8, p.y - 4);
          if (target && target.kind !== 'base' && Math.abs(target.x - p.x) < 18 && Math.abs(target.y - p.y) < 36) {
            applyDamage(b, p, p.x, p.y); p.dead = true;
          } else if (Math.abs(p.x - (p.side === 'player' ? ENEMY_COAST_X : PLAYER_COAST_X)) < 18) {
            applyDamage(b, p, p.x, p.y, true); p.dead = true;
          }
        }
        break;
      }
      case 'missile': {
        const speed = Math.hypot(p.vx, p.vy);
        const tx = target ? target.x : p.x + p.vx;
        const ty = target ? target.y : p.y + p.vy;
        const dx = tx - p.x, dy = ty - p.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const turn = 5.2 * dt;
        const desired = Math.atan2(dy, dx);
        const cur = Math.atan2(p.vy, p.vx);
        let diff = desired - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const na = cur + Math.max(-turn, Math.min(turn, diff));
        const ns = Math.min(speed + 500 * dt, 780);
        p.vx = Math.cos(na) * ns;
        p.vy = Math.sin(na) * ns;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (Math.random() < 0.5) b.effects.wakeTrail(p.x, p.y);
        if (target && d < 20) { applyDamage(b, p, p.x, p.y); p.dead = true; }
        if (p.y >= SEA_Y + 20) { applyDamage(b, p, p.x, SEA_Y); p.dead = true; }
        break;
      }
      case 'bomb': {
        p.vy += 380 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y >= SEA_Y - 2) { applyDamage(b, p, p.x, SEA_Y - 4); p.dead = true; }
        break;
      }
      case 'depthcharge': {
        const dx = (target ? target.x : p.x) - p.x;
        p.x += Math.max(-140, Math.min(140, dx * 2)) * dt;
        if (p.y < SUB_Y - 6) {
          p.y += 110 * dt;
        }
        if (target && Math.hypot(target.x - p.x, target.y - p.y) < 40) {
          applyDamage(b, p, p.x, p.y); p.dead = true;
        } else if (p.y >= SUB_Y + 20) {
          applyDamage(b, p, p.x, p.y); p.dead = true;
        }
        break;
      }
    }
    if (p.x < -100 || p.x > WORLD_W + 100 || p.y < -200 || p.y > 900) p.dead = true;
  }
  b.projectiles = b.projectiles.filter(p => !p.dead);
}

function unitWeaponFire(b: Battle, u: Unit, dt: number) {
  const oy = u.def.layer === 'sea' ? u.y - 18 * u.def.size : u.y;
  for (let i = 0; i < u.def.weapons.length; i++) {
    u.reloads[i] -= dt;
    if (u.reloads[i] > 0) continue;
    const w = WEAPONS[u.def.weapons[i]];
    const target = pickTarget(b, u.side, u.x, w);
    if (!target) { u.reloads[i] = 0.25; continue; }
    if (w.kind === 'bomb' && u.def.dive) {
      // dive bombers only release at the bottom of an attack run, leading the target
      const lead = target.x + target.vx * 0.4 - (u.x + u.vx * 0.42);
      if (u.divePhase !== 'dive' || u.y < SEA_Y - 105 || Math.abs(lead) > 34) continue;
      fire(b, u.side, u.x, u.y + 6, w, target, u.side === 'player' ? lvlMult(u.def.id) : 1, { vx: u.vx, vy: u.def.speed * 1.8 });
      u.reloads[i] = w.reload * (u.side === 'player' ? b.reloadMult() : b.enemyNation.reload);
      u.divePhase = 'climb';
      continue;
    }
    // bombs need to be roughly above target
    if (w.kind === 'bomb' && Math.abs(target.x - u.x) > w.range) { u.reloads[i] = 0.15; continue; }
    const volley = w.volley ?? 1;
    for (let v = 0; v < volley; v++) fire(b, u.side, u.x, oy - i * 4, w, target, u.side === 'player' ? lvlMult(u.def.id) : 1);
    u.reloads[i] = w.reload * (u.side === 'player' ? b.reloadMult() : b.enemyNation.reload);
  }
}

export function updateUnits(b: Battle, dt: number) {
  const dirOf = (s: Side) => (s === 'player' ? 1 : -1);
  for (const u of b.units) {
    if (u.dead) continue;
    u.flash = Math.max(0, u.flash - dt);
    const dir = dirOf(u.side);
    const def = u.def;

    if (def.layer === 'air') {
      // sweep the whole battlefield including over the enemy coast so bombers can strike the base
      const lo = u.side === 'player' ? PLAYER_COAST_X - 60 : 50;
      const hi = u.side === 'player' ? WORLD_W - 50 : ENEMY_COAST_X + 60;
      const cruiseY = def.altitude ?? 150;
      if (def.dive && u.divePhase === 'dive') {
        // attack run: steep descent onto the target
        u.x += u.vx * dt;
        u.y += def.speed * 1.8 * dt;
        if (Math.random() < 0.35) b.effects.wakeTrail(u.x - Math.sign(u.vx) * 10, u.y - 6);
        if (u.y >= SEA_Y - 45) u.divePhase = 'climb'; // pull out before hitting the water
      } else if (def.dive && u.divePhase === 'climb') {
        if (u.vx > 0 && u.x > hi) u.vx = -def.speed;
        if (u.vx < 0 && u.x < lo) u.vx = def.speed;
        u.x += u.vx * dt;
        u.y -= def.speed * 1.3 * dt;
        if (u.y <= cruiseY) { u.y = cruiseY; u.divePhase = 'cruise'; }
      } else {
        if (u.vx > 0 && u.x > hi) u.vx = -def.speed;
        if (u.vx < 0 && u.x < lo) u.vx = def.speed;
        u.x += u.vx * dt;
        u.y = cruiseY + Math.sin(b.time * 1.7 + u.uid) * 6;
        if (def.dive && u.reloads[0] <= 0) {
          // bomb is armed: tip into a dive once a target lies ahead at the right distance
          const w = WEAPONS[def.weapons[0]];
          const target = pickTarget(b, u.side, u.x, { ...w, range: 320 });
          if (target) {
            const dx = target.x + target.vx * 1.2 - u.x;
            const dist = (SEA_Y - 60 - u.y) / 1.8; // horizontal travel during the descent
            if (Math.sign(dx || 1) === Math.sign(u.vx) && Math.abs(dx) > dist * 0.5 && Math.abs(dx) < dist + 200) {
              u.divePhase = 'dive';
            }
          }
        }
      }
    } else {
      // move toward enemy unless blocked by a friendly unit ahead in the same lane or at the lane's stop line
      let blocked = false;
      for (const o of b.units) {
        if (o === u || o.dead || o.side !== u.side || o.def.layer !== def.layer || o.lane !== u.lane) continue;
        const ahead = dir === 1 ? o.x > u.x : o.x < u.x;
        if (ahead && Math.abs(o.x - u.x) < (o.def.size + def.size) * 34) { blocked = true; break; }
      }
      const stopDist = 240 + u.lane * 70;
      const stopX = dir === 1 ? ENEMY_COAST_X - stopDist : PLAYER_COAST_X + stopDist;
      const atLimit = dir === 1 ? u.x >= stopX : u.x <= stopX;
      if (!blocked && !atLimit) u.x += def.speed * dir * dt;
      if (def.layer === 'sea' && Math.random() < 0.15) b.effects.wakeTrail(u.x - dir * 30 * def.size, SEA_Y + 4);
      if (def.layer === 'sea' && def.size >= 1.1 && Math.random() < 0.06) {
        b.effects.funnelSmoke(u.x - dir * 6, u.y - 30 * def.size);
      }

      // track the main gun toward the current target so the barrel follows the attack direction
      const gunId = def.weapons.find(wid => {
        const k = WEAPONS[wid].kind;
        return k === 'shell' || k === 'bullet';
      });
      if (gunId) {
        const tgt = pickTarget(b, u.side, u.x, WEAPONS[gunId]);
        if (tgt) {
          const oy = u.y - 18 * def.size;
          const want = Math.atan2(tgt.y - oy, Math.abs(tgt.x - u.x));
          u.aim += (want - u.aim) * Math.min(1, dt * 8);
        }
      }
    }

    unitWeaponFire(b, u, dt);

    // carrier launches
    if (def.carrier) {
      u.launched = u.launched.filter(id => b.units.some(f => f.uid === id && !f.dead));
      u.carrierTimer -= dt;
      if (u.carrierTimer <= 0 && u.launched.length < def.carrier.maxAlive) {
        const child = spawnUnit(b, def.carrier.unitId, u.side);
        child.x = u.x;
        child.vx = dirOf(u.side) * child.def.speed;
        u.launched.push(child.uid);
        u.carrierTimer = def.carrier.interval;
        b.sound.launch();
      }
    }
  }
  b.units = b.units.filter(u => !u.dead);
}

export function updateTurrets(b: Battle, dt: number) {
  for (const t of b.turrets) {
    if (t.dead) continue;
    t.flash = Math.max(0, t.flash - dt);
    for (let i = 0; i < t.def.weapons.length; i++) {
      t.reloads[i] -= dt;
      const w = WEAPONS[t.def.weapons[i]];
      const target = pickTarget(b, t.side, t.x, w);
      if (target) {
        t.aimAngle = Math.atan2(target.y - (t.y - 16), Math.abs(target.x - t.x));
      }
      if (t.reloads[i] > 0) continue;
      if (!target) { t.reloads[i] = 0.3; continue; }
      fire(b, t.side, t.x, t.y - 18, w, target, t.side === 'player' ? lvlMult(t.def.id) : 1);
      t.reloads[i] = w.reload * (t.side === 'player' ? b.reloadMult() : b.enemyNation.reload);
    }
  }
  b.turrets = b.turrets.filter(t => !t.dead);
}

export function updateEnemyAI(b: Battle, dt: number) {
  b.enemyBudget += b.stage.enemyIncome * dt;
  b.aiTimer -= dt;
  if (b.aiTimer > 0) return;
  // attack in bursts: spend most of the budget on a small group at once
  b.aiTimer = 20 + Math.random() * 8;
  const pool = b.stage.enemyPool;
  let buys = 0;
  while (buys < 3) {
    const affordable = pool.filter(id => UNITS[id].cost <= b.enemyBudget);
    if (!affordable.length) break;
    const pick = affordable[Math.floor(Math.random() * affordable.length)];
    b.enemyBudget -= UNITS[pick].cost;
    spawnUnit(b, pick, 'enemy');
    buys++;
  }
}
