import { Sound } from './audio';
import { t } from './i18n';
import { Effects } from './effects';
import { eraById, stageById, UNITS, TURRETS } from './data';
import {
  spawnTurret, spawnUnit, updateEnemyAI, updateProjectiles, updateTurrets, updateUnits,
} from './entities';
import { EraDef, EraId, Projectile, StageDef, Turret, Unit } from './types';

export class Battle {
  stage: StageDef;
  era: EraDef;
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

  constructor(stageId: string) {
    this.stage = stageById(stageId);
    this.era = eraById(this.stage.era as EraId);
    this.resource = 150;
    this.playerBaseHp = this.stage.playerBaseHp;
    this.playerBaseMax = this.stage.playerBaseHp;
    this.enemyBaseHp = this.stage.enemyBaseHp;
    this.enemyBaseMax = this.stage.enemyBaseHp;
    for (const t of this.stage.enemyTurrets) spawnTurret(this, t.defId, 'enemy', t.slot);
    this.message = t('msgStart');
    this.messageTimer = 4;
  }

  buyUnit(defId: string): boolean {
    const def = UNITS[defId];
    if (!def || this.resource < def.cost || this.result) return false;
    this.resource -= def.cost;
    spawnUnit(this, defId, 'player');
    this.sound.click();
    return true;
  }

  buyTurret(defId: string, slot: number): boolean {
    const def = TURRETS[defId];
    if (!def || this.resource < def.cost || this.result) return false;
    if (this.turrets.some(t => t.side === 'player' && t.slot === slot)) return false;
    this.resource -= def.cost;
    spawnTurret(this, defId, 'player', slot);
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
    this.resource += this.era.income * dt;

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
      this.sound.win();
    } else if (this.playerBaseHp <= 0) {
      this.playerBaseHp = 0;
      this.result = 'lose';
      this.sound.lose();
    }
  }
}
