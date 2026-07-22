import { TURRETS, UNITS } from './data';
import { getNation } from './nations';

const KEY = 'coastal-artillery-armory';
const VER = 3;

// Tech tree: each entry unlocks only after its prerequisite is owned.
// Ships follow World-of-Warships-style class lines; aircraft follow an
// Ace-Combat-style branching tree rooted at the biplane.
export const TECH: Record<string, { req: string; price: number }> = {
  // destroyer line
  pt_boat: { req: 'gunboat', price: 120 },
  destroyer: { req: 'pt_boat', price: 180 },
  lcs: { req: 'destroyer', price: 280 },
  // cruiser line
  cruiser_ww2: { req: 'cruiser_ww1', price: 320 },
  missile_destroyer: { req: 'cruiser_ww2', price: 550 },
  aegis_cruiser: { req: 'missile_destroyer', price: 1000 },
  // battleship line (carrier caps the line)
  dreadnought: { req: 'cruiser_ww1', price: 600 },
  battleship: { req: 'dreadnought', price: 700 },
  carrier: { req: 'battleship', price: 900 },
  // submarine line
  uboat: { req: 'gunboat', price: 150 },
  submarine_ww2: { req: 'uboat', price: 320 },
  nuke_sub: { req: 'submarine_ww2', price: 500 },
  // aircraft: fighter path
  triplane: { req: 'biplane', price: 150 },
  fighter_ww2: { req: 'triplane', price: 200 },
  jet_fighter: { req: 'fighter_ww2', price: 500 },
  stealth_fighter: { req: 'jet_fighter', price: 900 },
  // aircraft: attacker path
  zeppelin: { req: 'biplane', price: 450 },
  dive_bomber: { req: 'fighter_ww2', price: 280 },
  torpedo_bomber: { req: 'dive_bomber', price: 450 },
  heavy_fighter: { req: 'torpedo_bomber', price: 380 },
  uav: { req: 'heavy_fighter', price: 400 },
};

// units that were free before the tech tree existed — granted to pre-tree saves
const LEGACY_FREE = [
  'pt_boat', 'destroyer', 'lcs', 'cruiser_ww2', 'missile_destroyer',
  'uboat', 'submarine_ww2', 'fighter_ww2', 'dive_bomber', 'uav',
];

export const LEVEL_MAX = 3;
const LEVEL_BONUS = 0.12;

interface NationProgress {
  owned: string[];
  levels: Record<string, number>;
}

// XP is shared across nations; research + upgrade levels are per-nation.
interface ArmoryState {
  ver?: number;
  xp: number;
  nations: Record<string, NationProgress>;
}

function load(): ArmoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as ArmoryState & { owned?: string[]; levels?: Record<string, number> };
      const ver = s.ver ?? 1;
      if (ver < 3) {
        // pre-v3: single shared progress — move it onto the currently selected nation
        const owned = s.owned || [];
        const levels = s.levels || {};
        if (ver < 2 && (s.xp > 0 || owned.length > 0 || Object.keys(levels).length > 0)) {
          for (const id of LEGACY_FREE) if (!owned.includes(id)) owned.push(id);
        }
        return { ver: VER, xp: s.xp || 0, nations: { [getNation().id]: { owned, levels } } };
      }
      return { ver: VER, xp: s.xp || 0, nations: s.nations || {} };
    }
  } catch { /* ignore */ }
  return { ver: VER, xp: 0, nations: {} };
}

let state = load();

function progress(): NationProgress {
  const nid = getNation().id;
  let p = state.nations[nid];
  if (!p) { p = { owned: [], levels: {} }; state.nations[nid] = p; }
  return p;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function getXp(): number { return state.xp; }

export function addXp(n: number) {
  state.xp += Math.max(0, Math.round(n));
  save();
}

export function isOwned(id: string): boolean {
  return !(id in TECH) || progress().owned.includes(id);
}

export function reqOf(id: string): string | null {
  return TECH[id]?.req ?? null;
}

export function canResearch(id: string): boolean {
  const node = TECH[id];
  return !!node && !isOwned(id) && isOwned(node.req);
}

export function buyPrice(id: string): number | null {
  return isOwned(id) ? null : TECH[id].price;
}

export function buyEquip(id: string): boolean {
  if (!canResearch(id)) return false;
  const price = TECH[id].price;
  if (state.xp < price) return false;
  state.xp -= price;
  progress().owned.push(id);
  save();
  return true;
}

export function levelOf(id: string): number {
  return progress().levels[id] ?? 0;
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
  progress().levels[id] = levelOf(id) + 1;
  save();
  return true;
}
