export const VIEW_W = 1280;
export const VIEW_H = 720;
export const WORLD_W = 2600;
export const SEA_Y = 470;
export const SUB_Y = 575;
export const PLAYER_COAST_X = 200;
export const ENEMY_COAST_X = WORLD_W - 200;
export const HUD_H = 118;
export const RADAR_W = 250;
export const RADAR_H = 64;
export const RADAR_X = VIEW_W - RADAR_W - 12;
export const RADAR_Y = VIEW_H - HUD_H + 16;

export type Side = 'player' | 'enemy';
export type Layer = 'sea' | 'air' | 'sub';
export type EraId = 'ww1' | 'ww2' | 'modern';
export type ProjectileKind = 'shell' | 'bullet' | 'torpedo' | 'missile' | 'bomb' | 'depthcharge';

export interface WeaponDef {
  id: string;
  targets: Layer[];
  range: number;
  damage: number;
  reload: number;
  kind: ProjectileKind;
  projSpeed: number;
  splash?: number;
  volley?: number;
  spread?: number;
  vsBaseMult?: number;
}

export interface CarrierDef {
  unitId: string;
  interval: number;
  maxAlive: number;
}

export interface UnitDef {
  id: string;
  name: string;
  era: EraId;
  layer: Layer;
  cost: number;
  hp: number;
  speed: number;
  weapons: string[];
  silhouette: string;
  bounty: number;
  size: number;
  desc: string;
  carrier?: CarrierDef;
  altitude?: number;
  boss?: boolean;
}

export interface TurretDef {
  id: string;
  name: string;
  era: EraId;
  cost: number;
  hp: number;
  weapons: string[];
  silhouette: string;
  desc: string;
}

export interface EraDef {
  id: EraId;
  name: string;
  years: string;
  units: string[];
  turrets: string[];
  bossUnit: string;
  income: number;
}

export interface WaveDef {
  at: number;
  units: string[];
}

export interface StageDef {
  id: string;
  era: EraId;
  index: number;
  name: string;
  enemyIncome: number;
  enemyBaseHp: number;
  playerBaseHp: number;
  enemyPool: string[];
  enemyTurrets: { defId: string; slot: number }[];
  playerUnits: string[];
  playerTurrets: string[];
  waves: WaveDef[];
  bossAt?: number;
}

export interface Unit {
  uid: number;
  def: UnitDef;
  side: Side;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  reloads: number[];
  carrierTimer: number;
  launched: number[];
  dead: boolean;
  flash: number;
  vx: number;
}

export interface Turret {
  uid: number;
  def: TurretDef;
  side: Side;
  slot: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  reloads: number[];
  aimAngle: number;
  dead: boolean;
  flash: number;
}

export interface Projectile {
  kind: ProjectileKind;
  side: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  splash: number;
  targets: Layer[];
  targetUid: number;
  life: number;
  vsBaseMult: number;
  dead: boolean;
}
