import { TURRETS, UNITS } from './data';

const KEY = 'coastal-artillery-armory';

// advanced equipment locked until purchased with XP
export const ADVANCED: Record<string, number> = {
  dreadnought: 600,
  zeppelin: 450,
  battleship: 700,
  carrier: 900,
  torpedo_bomber: 450,
  aegis_cruiser: 1000,
  nuke_sub: 500,
};

export const LEVEL_MAX = 3;
const LEVEL_BONUS = 0.12;

interface ArmoryState {
  xp: number;
  owned: string[];
  levels: Record<string, number>;
}

function load(): ArmoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as ArmoryState;
      return { xp: s.xp || 0, owned: s.owned || [], levels: s.levels || {} };
    }
  } catch { /* ignore */ }
  return { xp: 0, owned: [], levels: {} };
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function getXp(): number { return state.xp; }

export function addXp(n: number) {
  state.xp += Math.max(0, Math.round(n));
  save();
}

export function isOwned(id: string): boolean {
  return !(id in ADVANCED) || state.owned.includes(id);
}

export function buyPrice(id: string): number | null {
  return isOwned(id) ? null : ADVANCED[id];
}

export function buyEquip(id: string): boolean {
  const price = buyPrice(id);
  if (price === null || state.xp < price) return false;
  state.xp -= price;
  state.owned.push(id);
  save();
  return true;
}

export function levelOf(id: string): number {
  return state.levels[id] ?? 0;
}

export function lvlMult(id: string): number {
  return 1 + levelOf(id) * LEVEL_BONUS;
}

function defCost(id: string): number {
  return (UNITS[id] ?? TURRETS[id]).cost;
}

export function upgradePrice(id: string): number | null {
  const lvl = levelOf(id);
  if (lvl >= LEVEL_MAX) return null;
  const factor = [1.5, 2.5, 4][lvl];
  return Math.round((defCost(id) * factor) / 10) * 10;
}

export function upgradeEquip(id: string): boolean {
  if (!isOwned(id)) return false;
  const price = upgradePrice(id);
  if (price === null || state.xp < price) return false;
  state.xp -= price;
  state.levels[id] = levelOf(id) + 1;
  save();
  return true;
}
