import { lang } from './i18n';

const KEY = 'coastal-artillery-perks';

export interface PerkDef {
  id: string;
  name: [string, string];
  desc: [string, string];
}

export const PERKS: PerkDef[] = [
  { id: 'income', name: ['War Economy', '战争经济'], desc: ['Passive income +15%', '资源自动增长 +15%'] },
  { id: 'bounty', name: ['Prize Money', '战利品'], desc: ['Kill bounty +25%', '击杀奖励 +25%'] },
  { id: 'start_res', name: ['Reserve Fund', '战备储金'], desc: ['Start each battle with +150 resource', '每场战斗初始资源 +150'] },
  { id: 'cost', name: ['Shipyard Deal', '船厂订单'], desc: ['Units & turrets cost -10%', '出兵与炮塔造价 -10%'] },
  { id: 'dmg', name: ['Heavy Shells', '重型弹药'], desc: ['All damage +10%', '全体伤害 +10%'] },
  { id: 'reload', name: ['Drilled Crews', '精锐炮组'], desc: ['Reload time -10%', '装填时间 -10%'] },
  { id: 'unit_hp', name: ['Armor Plating', '附加装甲'], desc: ['Your units +15% HP', '我方单位生命 +15%'] },
  { id: 'turret_hp', name: ['Fortified Bunkers', '加固工事'], desc: ['Your turrets +25% HP', '我方炮塔生命 +25%'] },
  { id: 'base_hp', name: ['Coastal Fortress', '海岸要塞'], desc: ['Base max HP +20%', '基地最大生命 +20%'] },
  { id: 'base_regen', name: ['Field Engineers', '战地工兵'], desc: ['Base repairs 2 HP/s', '基地每秒修复 2 点生命'] },
];

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      if (Array.isArray(arr)) return arr.filter(id => PERKS.some(p => p.id === id));
    }
  } catch { /* ignore */ }
  return [];
}

let owned = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(owned)); } catch { /* ignore */ }
}

export function hasPerk(id: string): boolean { return owned.includes(id); }

export function ownedPerks(): PerkDef[] { return PERKS.filter(p => owned.includes(p.id)); }

export function rollChoices(n = 3): PerkDef[] {
  const pool = PERKS.filter(p => !owned.includes(p.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

export function takePerk(id: string) {
  if (!owned.includes(id) && PERKS.some(p => p.id === id)) {
    owned.push(id);
    save();
  }
}

export function perkName(p: PerkDef): string { return lang === 'zh' ? p.name[1] : p.name[0]; }
export function perkDesc(p: PerkDef): string { return lang === 'zh' ? p.desc[1] : p.desc[0]; }

export function perkIncomeMult(): number { return hasPerk('income') ? 1.15 : 1; }
export function perkBountyMult(): number { return hasPerk('bounty') ? 1.25 : 1; }
export function perkStartBonus(): number { return hasPerk('start_res') ? 150 : 0; }
export function perkCostMult(): number { return hasPerk('cost') ? 0.9 : 1; }
export function perkDmgMult(): number { return hasPerk('dmg') ? 1.1 : 1; }
export function perkReloadMult(): number { return hasPerk('reload') ? 0.9 : 1; }
export function perkUnitHpMult(): number { return hasPerk('unit_hp') ? 1.15 : 1; }
export function perkTurretHpMult(): number { return hasPerk('turret_hp') ? 1.25 : 1; }
export function perkBaseHpMult(): number { return hasPerk('base_hp') ? 1.2 : 1; }
export function perkBaseRegen(): number { return hasPerk('base_regen') ? 2 : 0; }
