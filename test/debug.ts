// Debug: trace a stage, logging base damage sources and field state.
declare const process: { argv: string[] };
import { Battle } from '../src/battle';
import { TURRETS, UNITS, WEAPONS } from '../src/data';
import { EraDef } from '../src/types';

function cheapestAntiSub(era: EraDef) {
  return era.units
    .map(id => UNITS[id])
    .filter(u => u.weapons.some(w => WEAPONS[w].targets.includes('sub')))
    .sort((a, b) => a.cost - b.cost)[0];
}

const stageId = process.argv[2] ?? 'mod-2';
const b = new Battle(stageId);
const dt = 1 / 60;
let turretSlot = 0;
let unitIdx = 0;
let lastLog = -10;
let lastBaseHp = b.playerBaseHp;

while (!b.result && b.time < 900) {
  b.update(dt);
  const turretOrder = [...b.era.turrets].sort((a, z) => TURRETS[a].cost - TURRETS[z].cost);
  if (turretSlot < 2) {
    const tDef = turretOrder[turretSlot];
    if (b.resource >= TURRETS[tDef].cost && b.buyTurret(tDef, turretSlot)) turretSlot++;
  }
  const enemySub = b.units.some(u => u.side === 'enemy' && u.def.layer === 'sub');
  const haveAntiSub = b.units.some(
    u => u.side === 'player' && u.def.weapons.some(w => WEAPONS[w].targets.includes('sub')),
  );
  if (enemySub && !haveAntiSub) {
    const as = cheapestAntiSub(b.era);
    if (as && b.resource >= as.cost && b.buyUnit(as.id)) continue;
  }
  const uid = b.era.units[unitIdx % b.era.units.length];
  const cost = UNITS[uid].cost;
  const playerUnitCount = b.units.filter(u => u.side === 'player').length;
  const surplusOk = cost <= 300 || b.resource >= cost * 1.4;
  if (b.resource >= cost && (surplusOk || playerUnitCount < 2)) {
    if (b.buyUnit(uid)) unitIdx++;
  }
  if (b.time - lastLog >= 10) {
    lastLog = b.time;
    const enemyUnits = b.units.filter(u => u.side === 'enemy').map(u => `${u.def.id}@${u.x.toFixed(0)}`).join(' ');
    const playerUnits = b.units.filter(u => u.side === 'player').length;
    console.log(`t=${b.time.toFixed(0)} base=${b.playerBaseHp.toFixed(0)} ebase=${b.enemyBaseHp.toFixed(0)} res=${b.resource.toFixed(0)} pUnits=${playerUnits} e: ${enemyUnits}`);
  }
  if (b.playerBaseHp < lastBaseHp - 50) {
    console.log(`  >> base hit at t=${b.time.toFixed(0)}: ${lastBaseHp.toFixed(0)} -> ${b.playerBaseHp.toFixed(0)}`);
    lastBaseHp = b.playerBaseHp;
  }
}
console.log(`RESULT: ${b.result} at t=${b.time.toFixed(0)}`);
