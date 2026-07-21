import { Sound } from './audio';
import { t } from './i18n';
import { Effects } from './effects';
import { eraById, stageById, UNITS, TURRETS } from './data';
import {
  spawnTurret, spawnUnit, updateEnemyAI, updateProjectiles, updateTurrets, updateUnits,
} from './entities';
import { EraDef, EraId, Projectile, StageDef, Turret, Unit } from './types';
import { getNation, NATIONS, NationDef } from './nations';
import { addXp, lvlMult } from './armory';
import {
  perkBaseHpMult, perkBaseRegen, perkCostMult, perkDmgMult, perkIncomeMult,
  perkReloadMult, perkStartBonus, perkTurretHpMult, perkUnitHpMult,
} from './perks';

export class Battle {
  stage: StageDef;
  era: EraDef;
  nation: NationDef = getNation();
  enemyNation: NationDef;
  units: Unit[] = [];
  turrets: Turret[] = [];
  projectiles: Projectile[] = [];
  effects = new Effects();
  sound = new Sound();
  time = 0;
  resource: number;
  score = 0;
  playerBaseHp: number;
  playerBaseMax: number;
  enemyBaseHp: number;
  enemyBaseMax: number;
  result: 'win' | 'lose' | null = null;
  waveIndex = 0;
  bossSpawned = false;
  enemyBudget = 40;
  aiTimer = 18;
  baseHitPlayer = 0;
  baseHitEnemy = 0;
  message = '';
  messageTimer = 0;
  upDamage = 0;
  upReload = 0;
  xpGained = 0;
  dcCooldown = 0;
  dcActive = 0;

  static UPGRADE_COSTS = [250, 500, 900];
  static UPGRADE_MAX = 3;
  static DC_COST = 250;
  static DC_COOLDOWN = 40;
  static DC_DURATION = 6;
  static DC_HEAL = 0.35;

  useDamageControl(): boolean {
    if (this.result || this.dcCooldown > 0 || this.resource < Battle.DC_COST) return false;
    this.resource -= Battle.DC_COST;
    this.dcActive = Battle.DC_DURATION;
    this.dcCooldown = Battle.DC_COOLDOWN;
    this.message = t('msgRepair');
    this.messageTimer = 2.5;
    this.sound.click();
    return true;
  }

  upgradeLevel(track: 'damage' | 'reload'): number {
    return track === 'damage' ? this.upDamage : this.upReload;
  }

  upgradeCost(track: 'damage' | 'reload'): number | null {
    const lvl = this.upgradeLevel(track);
    return lvl >= Battle.UPGRADE_MAX ? null : Battle.UPGRADE_COSTS[lvl];
  }

  buyUpgrade(track: 'damage' | 'reload'): boolean {
    const cost = this.upgradeCost(track);
    if (cost === null || this.resource < cost || this.result) return false;
    this.resource -= cost;
    if (track === 'damage') this.upDamage++; else this.upReload++;
    this.sound.click();
    return true;
  }

  dmgMult(): number { return (1 + this.upDamage * 0.15) * this.nation.dmg * perkDmgMult(); }

  reloadMult(): number { return (1 - this.upReload * 0.1) * this.nation.reload * perkReloadMult(); }

  costOf(def: { cost: number }): number { return Math.round(def.cost * this.nation.cost * perkCostMult()); }

  constructor(stageId: string) {
    this.stage = stageById(stageId);
    this.era = eraById(this.stage.era as EraId);
    const foes = NATIONS.filter(n => n.id !== this.nation.id);
    this.enemyNation = foes[Math.floor(Math.random() * foes.length)];
    this.resource = 150 + perkStartBonus();
    this.playerBaseHp = Math.round(this.stage.playerBaseHp * perkBaseHpMult());
    this.playerBaseMax = this.playerBaseHp;
    this.enemyBaseHp = this.stage.enemyBaseHp;
    this.enemyBaseMax = this.stage.enemyBaseHp;
    for (const t of this.stage.enemyTurrets) spawnTurret(this, t.defId, 'enemy', t.slot);
    this.message = t('msgStart');
    this.messageTimer = 4;
  }

  buyUnit(defId: string): boolean {
    const def = UNITS[defId];
    if (!def) return false;
    const cost = this.costOf(def);
    if (this.resource < cost || this.result) return false;
    this.resource -= cost;
    const u = spawnUnit(this, defId, 'player');
    u.maxHp = Math.round(def.hp * this.nation.hp * lvlMult(defId) * perkUnitHpMult());
    u.hp = u.maxHp;
    this.sound.click();
    return true;
  }

  buyTurret(defId: string, slot: number): boolean {
    const def = TURRETS[defId];
    if (!def) return false;
    const cost = this.costOf(def);
    if (this.resource < cost || this.result) return false;
    if (this.turrets.some(t => t.side === 'player' && t.slot === slot)) return false;
    this.resource -= cost;
    const tr = spawnTurret(this, defId, 'player', slot);
    tr.maxHp = Math.round(def.hp * this.nation.hp * lvlMult(defId) * perkTurretHpMult());
    tr.hp = tr.maxHp;
    this.sound.click();
    return true;
  }

  playerTurretSlotsTaken(): Set<number> {
    return new Set(this.turrets.filter(t => t.side === 'player').map(t => t.slot));
  }

  update(dt: number) {
    if (this.result) return;
    this.time += dt;
    this.baseHitPlayer = Math.max(0, this.baseHitPlayer - dt);
    this.baseHitEnemy = Math.max(0, this.baseHitEnemy - dt);
    this.messageTimer = Math.max(0, this.messageTimer - dt);

    // passive income
    this.resource += this.era.income * perkIncomeMult() * dt;

    // base repair perk
    const regen = perkBaseRegen();
    if (regen > 0 && this.playerBaseHp > 0) {
      this.playerBaseHp = Math.min(this.playerBaseMax, this.playerBaseHp + regen * dt);
    }

    // damage control: heal-over-time for all friendly units & turrets
    this.dcCooldown = Math.max(0, this.dcCooldown - dt);
    if (this.dcActive > 0) {
      this.dcActive = Math.max(0, this.dcActive - dt);
      const frac = (Battle.DC_HEAL / Battle.DC_DURATION) * dt;
      for (const u of this.units) {
        if (u.side !== 'player' || u.hp <= 0 || u.hp >= u.maxHp) continue;
        u.hp = Math.min(u.maxHp, u.hp + u.maxHp * frac);
        if (Math.random() < dt * 6) this.effects.repairSpark(u.x, u.y - 8);
      }
      for (const tr of this.turrets) {
        if (tr.side !== 'player' || tr.hp <= 0 || tr.hp >= tr.maxHp) continue;
        tr.hp = Math.min(tr.maxHp, tr.hp + tr.maxHp * frac);
        if (Math.random() < dt * 6) this.effects.repairSpark(tr.x, tr.y - 8);
      }
    }

    // scripted waves
    const waves = this.stage.waves;
    while (this.waveIndex < waves.length && this.time >= waves[this.waveIndex].at) {
      for (const id of waves[this.waveIndex].units) spawnUnit(this, id, 'enemy');
      this.message = t('msgWave');
      this.messageTimer = 2.5;
      this.waveIndex++;
    }

    // boss
    if (!this.bossSpawned && this.stage.bossAt && this.time >= this.stage.bossAt) {
      spawnUnit(this, this.era.bossUnit, 'enemy');
      this.bossSpawned = true;
      this.message = t('msgBoss');
      this.messageTimer = 4;
      this.sound.alarm();
    }

    updateEnemyAI(this, dt);
    updateUnits(this, dt);
    updateTurrets(this, dt);
    updateProjectiles(this, dt);
    this.effects.update(dt);

    if (this.enemyBaseHp <= 0) {
      this.enemyBaseHp = 0;
      this.result = 'win';
      this.xpGained = this.score;
      addXp(this.xpGained);
      this.sound.win();
    } else if (this.playerBaseHp <= 0) {
      this.playerBaseHp = 0;
      this.result = 'lose';
      this.xpGained = Math.floor(this.score / 2);
      addXp(this.xpGained);
      this.sound.lose();
    }
  }
}
