// Headless balance simulation: plays every stage with a reasonable policy and reports outcomes.
import { Battle } from '../src/battle';
import { STAGES, UNITS, TURRETS, WEAPONS } from '../src/data';
import { StageDef } from '../src/types';

function cheapestAntiSub(stage: StageDef) {
  return stage.playerUnits
    .map(id => UNITS[id])
    .filter(u => u.weapons.some(w => WEAPONS[w].targets.includes('sub')))
    .sort((a, b) => a.cost - b.cost)[0];
}

function playStage(stageId: string, maxSeconds = 900) {
  const b = new Battle(stageId);
  const dt = 1 / 60;
  let turretSlot = 0;
  let unitIdx = 0;
  while (!b.result && b.time < maxSeconds) {
    b.update(dt);
    // turrets: fill first two slots, cheaper turret first for faster defense
    const turretOrder = [...b.stage.playerTurrets].sort((a, z) => TURRETS[a].cost - TURRETS[z].cost);
    if (turretSlot < 2) {
      const tDef = turretOrder[Math.min(turretSlot, turretOrder.length - 1)];
      if (b.resource >= TURRETS[tDef].cost && b.buyTurret(tDef, turretSlot)) turretSlot++;
    }
    // anti-sub reaction: keep one hunter per active enemy sub
    const enemySubs = b.units.filter(u => u.side === 'enemy' && u.def.layer === 'sub').length;
    const antiSubs = b.units.filter(
      u => u.side === 'player' && u.def.weapons.some(w => WEAPONS[w].targets.includes('sub')),
    ).length;
    if (enemySubs > antiSubs) {
      const as = cheapestAntiSub(b.stage);
      if (as && b.resource >= as.cost && b.buyUnit(as.id)) continue;
    }
    // squad buying: cheap units promptly, expensive ones wait for a surplus
    const uid = b.stage.playerUnits[unitIdx % b.stage.playerUnits.length];
    const cost = UNITS[uid].cost;
    const playerUnitCount = b.units.filter(u => u.side === 'player').length;
    const surplusOk = cost <= 300 || b.resource >= cost * 1.4;
    if (b.resource >= cost && (surplusOk || playerUnitCount < 2)) {
      if (b.buyUnit(uid)) unitIdx++;
    }
  }
  return b;
}

let pass = 0;
for (const s of STAGES) {
  const b = playStage(s.id);
  const ok = b.result === 'win';
  if (ok) pass++;
  console.log(
    `${ok ? 'WIN ' : 'FAIL'} ${s.id.padEnd(7)} time=${b.time.toFixed(0)}s ` +
    `base=${b.playerBaseHp.toFixed(0)}/${b.playerBaseMax} enemy=${b.enemyBaseHp.toFixed(0)}/${b.enemyBaseMax} ` +
    `unitsLeft=${b.units.length} score=${b.score}`,
  );
}
console.log(`\n${pass}/${STAGES.length} stages won by simple policy`);
