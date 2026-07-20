import { EraDef, StageDef, TurretDef, UnitDef, WeaponDef } from './types';

export const WEAPONS: Record<string, WeaponDef> = {
  // ---- WWI ----
  light_gun: { id: 'light_gun', targets: ['sea'], range: 270, damage: 18, reload: 2.2, kind: 'shell', projSpeed: 420, splash: 10, vsBaseMult: 1 },
  med_gun: { id: 'med_gun', targets: ['sea'], range: 310, damage: 30, reload: 3.0, kind: 'shell', projSpeed: 460, splash: 14, vsBaseMult: 1 },
  heavy_gun: { id: 'heavy_gun', targets: ['sea'], range: 470, damage: 95, reload: 6.5, kind: 'shell', projSpeed: 520, splash: 30, vsBaseMult: 1 },
  coast_gun_ww1: { id: 'coast_gun_ww1', targets: ['sea'], range: 540, damage: 85, reload: 5.0, kind: 'shell', projSpeed: 560, splash: 30, vsBaseMult: 0.6 },
  aa_mg: { id: 'aa_mg', targets: ['air'], range: 340, damage: 9, reload: 0.35, kind: 'bullet', projSpeed: 900 },
  plane_mg: { id: 'plane_mg', targets: ['air', 'sea'], range: 210, damage: 7, reload: 0.5, kind: 'bullet', projSpeed: 850, vsBaseMult: 0.15 },
  torpedo_ww1: { id: 'torpedo_ww1', targets: ['sea', 'sub'], range: 260, damage: 95, reload: 6.0, kind: 'torpedo', projSpeed: 150, splash: 12, vsBaseMult: 0.25 },
  bombs_ww1: { id: 'bombs_ww1', targets: ['sea'], range: 130, damage: 80, reload: 5.0, kind: 'bomb', projSpeed: 0, splash: 42, vsBaseMult: 0.6 },
  depth_charge_ww1: { id: 'depth_charge_ww1', targets: ['sub'], range: 150, damage: 55, reload: 4.5, kind: 'depthcharge', projSpeed: 60, splash: 40 },

  // ---- WWII ----
  dp_gun: { id: 'dp_gun', targets: ['sea', 'air'], range: 310, damage: 22, reload: 1.8, kind: 'shell', projSpeed: 560, splash: 12, vsBaseMult: 0.6 },
  big_gun: { id: 'big_gun', targets: ['sea'], range: 560, damage: 130, reload: 7.5, kind: 'shell', projSpeed: 580, splash: 34, vsBaseMult: 1 },
  cruiser_gun: { id: 'cruiser_gun', targets: ['sea'], range: 380, damage: 55, reload: 3.4, kind: 'shell', projSpeed: 560, splash: 18, vsBaseMult: 1 },
  coast_gun_ww2: { id: 'coast_gun_ww2', targets: ['sea'], range: 540, damage: 80, reload: 4.5, kind: 'shell', projSpeed: 600, splash: 34, vsBaseMult: 0.6 },
  flak: { id: 'flak', targets: ['air'], range: 430, damage: 26, reload: 1.2, kind: 'bullet', projSpeed: 950, splash: 20 },
  aa_gun_ww2: { id: 'aa_gun_ww2', targets: ['air'], range: 330, damage: 12, reload: 0.5, kind: 'bullet', projSpeed: 900 },
  depth_charge: { id: 'depth_charge', targets: ['sub'], range: 170, damage: 65, reload: 4.0, kind: 'depthcharge', projSpeed: 60, splash: 46 },
  torpedo_ww2: { id: 'torpedo_ww2', targets: ['sea', 'sub'], range: 270, damage: 125, reload: 7.0, kind: 'torpedo', projSpeed: 170, splash: 14, vsBaseMult: 0.25 },
  fighter_mg: { id: 'fighter_mg', targets: ['air'], range: 250, damage: 13, reload: 0.45, kind: 'bullet', projSpeed: 950 },
  light_bombs: { id: 'light_bombs', targets: ['sea'], range: 120, damage: 55, reload: 4.0, kind: 'bomb', projSpeed: 0, splash: 36, vsBaseMult: 0.8 },
  air_torpedo: { id: 'air_torpedo', targets: ['sea'], range: 320, damage: 135, reload: 6.0, kind: 'torpedo', projSpeed: 180, splash: 14, vsBaseMult: 0.4 },
  heavy_bombs: { id: 'heavy_bombs', targets: ['sea'], range: 130, damage: 110, reload: 5.5, kind: 'bomb', projSpeed: 0, splash: 40, vsBaseMult: 0.8 },
  pt_gun: { id: 'pt_gun', targets: ['sea', 'air'], range: 220, damage: 10, reload: 0.6, kind: 'bullet', projSpeed: 880, vsBaseMult: 0.2 },

  // ---- Modern ----
  gun_mod: { id: 'gun_mod', targets: ['sea'], range: 330, damage: 26, reload: 1.2, kind: 'shell', projSpeed: 640, splash: 12, vsBaseMult: 0.5 },
  vls_antiship: { id: 'vls_antiship', targets: ['sea'], range: 720, damage: 110, reload: 5.0, kind: 'missile', projSpeed: 520, splash: 24, vsBaseMult: 0.7 },
  asm_turret: { id: 'asm_turret', targets: ['sea'], range: 700, damage: 110, reload: 5.0, kind: 'missile', projSpeed: 540, splash: 26, vsBaseMult: 0.6 },
  ciws: { id: 'ciws', targets: ['air'], range: 390, damage: 20, reload: 0.35, kind: 'bullet', projSpeed: 1100, splash: 8 },
  asroc: { id: 'asroc', targets: ['sub'], range: 420, damage: 85, reload: 6.0, kind: 'depthcharge', projSpeed: 300, splash: 50 },
  torpedo_mod: { id: 'torpedo_mod', targets: ['sea', 'sub'], range: 330, damage: 160, reload: 7.0, kind: 'torpedo', projSpeed: 210, splash: 16, vsBaseMult: 0.25 },
  aam: { id: 'aam', targets: ['air'], range: 430, damage: 30, reload: 1.5, kind: 'missile', projSpeed: 780 },
  drone_missile: { id: 'drone_missile', targets: ['sea'], range: 310, damage: 70, reload: 4.0, kind: 'missile', projSpeed: 560, splash: 20, vsBaseMult: 0.8 },
};

export const UNITS: Record<string, UnitDef> = {
  // ---- WWI ----
  gunboat: { id: 'gunboat', name: 'Gunboat', era: 'ww1', layer: 'sea', cost: 80, hp: 230, speed: 46, weapons: ['light_gun', 'depth_charge_ww1'], silhouette: 'gunboat', bounty: 40, size: 0.8, desc: 'Fast escort ship, hunts U-boats' },
  cruiser_ww1: { id: 'cruiser_ww1', name: 'Cruiser', era: 'ww1', layer: 'sea', cost: 190, hp: 560, speed: 36, weapons: ['med_gun', 'med_gun'], silhouette: 'cruiser', bounty: 90, size: 1.1, desc: 'Balanced firepower and armor' },
  dreadnought: { id: 'dreadnought', name: 'Dreadnought', era: 'ww1', layer: 'sea', cost: 400, hp: 1300, speed: 24, weapons: ['heavy_gun', 'heavy_gun', 'aa_mg'], silhouette: 'dreadnought', bounty: 200, size: 1.5, desc: 'Heavy battleship, slow but devastating' },
  uboat: { id: 'uboat', name: 'U-Boat', era: 'ww1', layer: 'sub', cost: 230, hp: 320, speed: 32, weapons: ['torpedo_ww1'], silhouette: 'uboat', bounty: 120, size: 0.9, desc: 'Submarine, immune to guns — use depth charges or subs' },
  biplane: { id: 'biplane', name: 'Biplane', era: 'ww1', layer: 'air', cost: 150, hp: 150, speed: 100, weapons: ['plane_mg'], silhouette: 'biplane', bounty: 75, size: 0.7, altitude: 150, desc: 'Fragile but quick scout fighter' },
  zeppelin: { id: 'zeppelin', name: 'Zeppelin', era: 'ww1', layer: 'air', cost: 330, hp: 560, speed: 40, weapons: ['bombs_ww1'], silhouette: 'zeppelin', bounty: 170, size: 1.6, altitude: 100, desc: 'Slow bomber airship, heavy splash' },
  boss_dreadnought: { id: 'boss_dreadnought', name: 'Super Dreadnought', era: 'ww1', layer: 'sea', cost: 0, hp: 3800, speed: 16, weapons: ['heavy_gun', 'heavy_gun', 'heavy_gun', 'aa_mg'], silhouette: 'dreadnought', bounty: 900, size: 2.1, desc: 'BOSS', boss: true },

  // ---- WWII ----
  pt_boat: { id: 'pt_boat', name: 'PT Boat', era: 'ww2', layer: 'sea', cost: 100, hp: 180, speed: 78, weapons: ['pt_gun', 'torpedo_ww2'], silhouette: 'pt_boat', bounty: 50, size: 0.65, desc: 'Fast torpedo boat, hit and run' },
  destroyer: { id: 'destroyer', name: 'Destroyer', era: 'ww2', layer: 'sea', cost: 160, hp: 400, speed: 52, weapons: ['dp_gun', 'depth_charge'], silhouette: 'destroyer', bounty: 85, size: 0.9, desc: 'Escort ship, hunts submarines' },
  cruiser_ww2: { id: 'cruiser_ww2', name: 'Heavy Cruiser', era: 'ww2', layer: 'sea', cost: 300, hp: 850, speed: 40, weapons: ['cruiser_gun', 'cruiser_gun', 'aa_gun_ww2'], silhouette: 'cruiser_ww2', bounty: 150, size: 1.25, desc: '8-inch guns, fast and tough' },
  battleship: { id: 'battleship', name: 'Battleship', era: 'ww2', layer: 'sea', cost: 430, hp: 1650, speed: 28, weapons: ['big_gun', 'big_gun', 'aa_gun_ww2'], silhouette: 'dreadnought', bounty: 220, size: 1.6, desc: 'Huge guns: extreme range, slow reload' },
  carrier: { id: 'carrier', name: 'Carrier', era: 'ww2', layer: 'sea', cost: 580, hp: 1150, speed: 25, weapons: ['aa_gun_ww2'], silhouette: 'carrier', bounty: 300, size: 1.7, desc: 'Launches fighters over time', carrier: { unitId: 'fighter_ww2', interval: 9, maxAlive: 3 } },
  submarine_ww2: { id: 'submarine_ww2', name: 'Submarine', era: 'ww2', layer: 'sub', cost: 290, hp: 400, speed: 34, weapons: ['torpedo_ww2'], silhouette: 'uboat', bounty: 150, size: 1.0, desc: 'Long-range torpedo ambusher' },
  fighter_ww2: { id: 'fighter_ww2', name: 'Fighter', era: 'ww2', layer: 'air', cost: 210, hp: 210, speed: 130, weapons: ['fighter_mg', 'light_bombs'], silhouette: 'fighter', bounty: 105, size: 0.7, altitude: 140, desc: 'Dogfighter with light bombs' },
  dive_bomber: { id: 'dive_bomber', name: 'Dive Bomber', era: 'ww2', layer: 'air', cost: 260, hp: 230, speed: 115, weapons: ['heavy_bombs'], silhouette: 'divebomber', bounty: 130, size: 0.8, altitude: 165, desc: 'Heavy bomb dropped from above' },
  torpedo_bomber: { id: 'torpedo_bomber', name: 'Torpedo Bomber', era: 'ww2', layer: 'air', cost: 310, hp: 240, speed: 110, weapons: ['air_torpedo'], silhouette: 'bomber', bounty: 160, size: 0.9, altitude: 180, desc: 'Ship-killer from the sky' },
  boss_yamato: { id: 'boss_yamato', name: 'Yamato-class', era: 'ww2', layer: 'sea', cost: 0, hp: 5600, speed: 17, weapons: ['big_gun', 'big_gun', 'big_gun', 'aa_gun_ww2', 'aa_gun_ww2'], silhouette: 'dreadnought', bounty: 1500, size: 2.3, desc: 'BOSS', boss: true },

  // ---- Modern 2026 ----
  lcs: { id: 'lcs', name: 'Littoral Ship', era: 'modern', layer: 'sea', cost: 210, hp: 440, speed: 64, weapons: ['gun_mod', 'ciws'], silhouette: 'lcs', bounty: 110, size: 0.9, desc: 'Fast multi-role combat ship' },
  missile_destroyer: { id: 'missile_destroyer', name: 'Missile Destroyer', era: 'modern', layer: 'sea', cost: 500, hp: 950, speed: 44, weapons: ['vls_antiship', 'ciws', 'asroc'], silhouette: 'missile_destroyer', bounty: 260, size: 1.3, desc: 'VLS missiles strike far beyond horizon' },
  aegis_cruiser: { id: 'aegis_cruiser', name: 'Aegis Cruiser', era: 'modern', layer: 'sea', cost: 660, hp: 1450, speed: 38, weapons: ['vls_antiship', 'vls_antiship', 'ciws', 'asroc'], silhouette: 'aegis', bounty: 340, size: 1.5, desc: 'Fleet air-defense and strike core' },
  nuke_sub: { id: 'nuke_sub', name: 'Nuclear Sub', era: 'modern', layer: 'sub', cost: 430, hp: 540, speed: 38, weapons: ['torpedo_mod', 'torpedo_mod'], silhouette: 'nuke_sub', bounty: 230, size: 1.2, desc: 'Silent heavy torpedo hunter' },
  jet_fighter: { id: 'jet_fighter', name: 'Jet Fighter', era: 'modern', layer: 'air', cost: 330, hp: 270, speed: 195, weapons: ['aam', 'fighter_mg'], silhouette: 'jet', bounty: 170, size: 0.8, altitude: 130, desc: 'Supersonic air superiority' },
  uav: { id: 'uav', name: 'Strike UAV', era: 'modern', layer: 'air', cost: 270, hp: 170, speed: 120, weapons: ['drone_missile'], silhouette: 'uav', bounty: 140, size: 0.7, altitude: 190, desc: 'Precision standoff missile drone' },
  boss_carrier: { id: 'boss_carrier', name: 'Supercarrier', era: 'modern', layer: 'sea', cost: 0, hp: 7400, speed: 20, weapons: ['ciws', 'ciws', 'vls_antiship'], silhouette: 'carrier', bounty: 2200, size: 2.4, desc: 'BOSS', boss: true, carrier: { unitId: 'jet_fighter', interval: 11, maxAlive: 3 } },
};

export const TURRETS: Record<string, TurretDef> = {
  howitzer_ww1: { id: 'howitzer_ww1', name: 'Coast Howitzer', era: 'ww1', cost: 260, hp: 620, weapons: ['coast_gun_ww1'], silhouette: 'turret_gun', desc: 'Long-range anti-ship artillery' },
  aa_nest_ww1: { id: 'aa_nest_ww1', name: 'AA MG Nest', era: 'ww1', cost: 150, hp: 320, weapons: ['aa_mg', 'aa_mg'], silhouette: 'turret_aa', desc: 'Rapid anti-air machine guns' },
  coastal_ww2: { id: 'coastal_ww2', name: 'Coastal Artillery', era: 'ww2', cost: 310, hp: 720, weapons: ['coast_gun_ww2'], silhouette: 'turret_gun', desc: 'Heavy casemate gun' },
  flak88: { id: 'flak88', name: 'Flak 88', era: 'ww2', cost: 210, hp: 360, weapons: ['flak'], silhouette: 'turret_aa', desc: 'Deadly anti-air cannon' },
  asm_mod: { id: 'asm_mod', name: 'ASM Launcher', era: 'modern', cost: 420, hp: 620, weapons: ['asm_turret'], silhouette: 'turret_missile', desc: 'Anti-ship missile battery, extreme range' },
  ciws_mod: { id: 'ciws_mod', name: 'CIWS', era: 'modern', cost: 300, hp: 420, weapons: ['ciws'], silhouette: 'turret_ciws', desc: 'Close-in weapon system vs aircraft' },
};

export const ERAS: EraDef[] = [
  {
    id: 'ww1', name: 'The Great War', years: '1914 — 1918',
    units: ['gunboat', 'cruiser_ww1', 'dreadnought', 'uboat', 'biplane', 'zeppelin'],
    turrets: ['howitzer_ww1', 'aa_nest_ww1'], bossUnit: 'boss_dreadnought', income: 13,
  },
  {
    id: 'ww2', name: 'World War II', years: '1939 — 1945',
    units: ['pt_boat', 'destroyer', 'cruiser_ww2', 'battleship', 'carrier', 'submarine_ww2', 'fighter_ww2', 'dive_bomber', 'torpedo_bomber'],
    turrets: ['coastal_ww2', 'flak88'], bossUnit: 'boss_yamato', income: 14,
  },
  {
    id: 'modern', name: 'Modern Warfare', years: '2026',
    units: ['lcs', 'missile_destroyer', 'aegis_cruiser', 'nuke_sub', 'jet_fighter', 'uav'],
    turrets: ['asm_mod', 'ciws_mod'], bossUnit: 'boss_carrier', income: 15,
  },
];

export const STAGES: StageDef[] = [
  // ---- WWI ----
  {
    id: 'ww1-1', era: 'ww1', index: 0, name: 'First Contact', enemyIncome: 9, enemyBaseHp: 1400, playerBaseHp: 2000,
    enemyPool: ['gunboat', 'gunboat', 'cruiser_ww1'],
    enemyTurrets: [],
    playerUnits: ['gunboat', 'cruiser_ww1', 'biplane'],
    playerTurrets: ['howitzer_ww1'],
    waves: [
      { at: 8, units: ['gunboat'] },
      { at: 45, units: ['gunboat', 'gunboat'] },
      { at: 85, units: ['cruiser_ww1'] },
    ],
  },
  {
    id: 'ww1-2', era: 'ww1', index: 1, name: 'Steel Tide', enemyIncome: 11, enemyBaseHp: 1800, playerBaseHp: 2000,
    enemyPool: ['gunboat', 'cruiser_ww1', 'uboat', 'biplane'],
    enemyTurrets: [{ defId: 'howitzer_ww1', slot: 2 }],
    playerUnits: ['gunboat', 'uboat', 'dreadnought', 'zeppelin'],
    playerTurrets: ['howitzer_ww1', 'aa_nest_ww1'],
    waves: [
      { at: 8, units: ['gunboat', 'gunboat'] },
      { at: 50, units: ['uboat'] },
      { at: 95, units: ['cruiser_ww1', 'biplane'] },
      { at: 140, units: ['dreadnought'] },
    ],
  },
  {
    id: 'ww1-3', era: 'ww1', index: 2, name: 'Jutland', enemyIncome: 12.5, enemyBaseHp: 2200, playerBaseHp: 2200,
    enemyPool: ['cruiser_ww1', 'dreadnought', 'uboat', 'biplane', 'zeppelin'],
    enemyTurrets: [{ defId: 'howitzer_ww1', slot: 1 }, { defId: 'aa_nest_ww1', slot: 3 }],
    playerUnits: ['gunboat', 'cruiser_ww1', 'dreadnought', 'uboat', 'biplane', 'zeppelin'],
    playerTurrets: ['howitzer_ww1', 'aa_nest_ww1'],
    waves: [
      { at: 8, units: ['cruiser_ww1', 'gunboat'] },
      { at: 60, units: ['uboat', 'biplane'] },
      { at: 115, units: ['dreadnought', 'biplane'] },
    ],
    bossAt: 180,
  },
  // ---- WWII ----
  {
    id: 'ww2-1', era: 'ww2', index: 0, name: 'Channel Dash', enemyIncome: 8.5, enemyBaseHp: 1600, playerBaseHp: 2400,
    enemyPool: ['pt_boat', 'destroyer', 'destroyer', 'submarine_ww2'],
    enemyTurrets: [{ defId: 'flak88', slot: 2 }],
    playerUnits: ['pt_boat', 'destroyer', 'fighter_ww2'],
    playerTurrets: ['coastal_ww2'],
    waves: [
      { at: 8, units: ['pt_boat', 'pt_boat'] },
      { at: 50, units: ['submarine_ww2'] },
      { at: 95, units: ['destroyer', 'fighter_ww2'] },
    ],
  },
  {
    id: 'ww2-2', era: 'ww2', index: 1, name: 'Wolfpack', enemyIncome: 9, enemyBaseHp: 2000, playerBaseHp: 2200,
    enemyPool: ['destroyer', 'submarine_ww2', 'submarine_ww2', 'fighter_ww2', 'torpedo_bomber'],
    enemyTurrets: [{ defId: 'coastal_ww2', slot: 2 }, { defId: 'flak88', slot: 3 }],
    playerUnits: ['destroyer', 'cruiser_ww2', 'submarine_ww2', 'fighter_ww2', 'dive_bomber'],
    playerTurrets: ['coastal_ww2', 'flak88'],
    waves: [
      { at: 25, units: ['submarine_ww2', 'submarine_ww2'] },
      { at: 55, units: ['destroyer', 'fighter_ww2'] },
      { at: 105, units: ['torpedo_bomber', 'fighter_ww2'] },
      { at: 150, units: ['cruiser_ww2'] },
    ],
  },
  {
    id: 'ww2-3', era: 'ww2', index: 2, name: 'Pacific Storm', enemyIncome: 12, enemyBaseHp: 2400, playerBaseHp: 2400,
    enemyPool: ['destroyer', 'cruiser_ww2', 'battleship', 'submarine_ww2', 'fighter_ww2', 'torpedo_bomber', 'carrier'],
    enemyTurrets: [{ defId: 'coastal_ww2', slot: 1 }, { defId: 'flak88', slot: 2 }, { defId: 'flak88', slot: 3 }],
    playerUnits: ['pt_boat', 'destroyer', 'cruiser_ww2', 'battleship', 'carrier', 'submarine_ww2', 'fighter_ww2', 'dive_bomber', 'torpedo_bomber'],
    playerTurrets: ['coastal_ww2', 'flak88'],
    waves: [
      { at: 8, units: ['destroyer', 'fighter_ww2'] },
      { at: 60, units: ['carrier'] },
      { at: 115, units: ['battleship', 'torpedo_bomber'] },
    ],
    bossAt: 190,
  },
  // ---- Modern ----
  {
    id: 'mod-1', era: 'modern', index: 0, name: 'Blockade', enemyIncome: 9, enemyBaseHp: 1800, playerBaseHp: 2400,
    enemyPool: ['lcs', 'lcs', 'uav'],
    enemyTurrets: [{ defId: 'ciws_mod', slot: 2 }],
    playerUnits: ['lcs', 'uav', 'jet_fighter'],
    playerTurrets: ['asm_mod'],
    waves: [
      { at: 8, units: ['lcs'] },
      { at: 50, units: ['uav', 'lcs'] },
      { at: 95, units: ['lcs', 'uav'] },
    ],
  },
  {
    id: 'mod-2', era: 'modern', index: 1, name: 'A2/AD', enemyIncome: 10.5, enemyBaseHp: 2200, playerBaseHp: 2600,
    enemyPool: ['lcs', 'missile_destroyer', 'nuke_sub', 'uav'],
    enemyTurrets: [{ defId: 'asm_mod', slot: 2 }, { defId: 'ciws_mod', slot: 3 }],
    playerUnits: ['lcs', 'missile_destroyer', 'nuke_sub', 'uav'],
    playerTurrets: ['asm_mod', 'ciws_mod'],
    waves: [
      { at: 25, units: ['nuke_sub'] },
      { at: 50, units: ['jet_fighter', 'uav'] },
      { at: 105, units: ['missile_destroyer', 'lcs'] },
    ],
  },
  {
    id: 'mod-3', era: 'modern', index: 2, name: 'Carrier Killer', enemyIncome: 11, enemyBaseHp: 2600, playerBaseHp: 2800,
    enemyPool: ['lcs', 'missile_destroyer', 'aegis_cruiser', 'nuke_sub', 'jet_fighter', 'uav'],
    enemyTurrets: [{ defId: 'asm_mod', slot: 1 }, { defId: 'ciws_mod', slot: 2 }, { defId: 'ciws_mod', slot: 3 }],
    playerUnits: ['lcs', 'missile_destroyer', 'aegis_cruiser', 'nuke_sub', 'jet_fighter', 'uav'],
    playerTurrets: ['asm_mod', 'ciws_mod'],
    waves: [
      { at: 35, units: ['lcs', 'jet_fighter'] },
      { at: 75, units: ['aegis_cruiser'] },
      { at: 115, units: ['nuke_sub', 'uav', 'uav'] },
    ],
    bossAt: 240,
  },
];

export function stageById(id: string): StageDef {
  const s = STAGES.find(s => s.id === id);
  if (!s) throw new Error('unknown stage ' + id);
  return s;
}

export function eraById(id: string): EraDef {
  const e = ERAS.find(e => e.id === id);
  if (!e) throw new Error('unknown era ' + id);
  return e;
}

export function nextStageId(id: string): string | null {
  const i = STAGES.findIndex(s => s.id === id);
  return i >= 0 && i + 1 < STAGES.length ? STAGES[i + 1].id : null;
}
