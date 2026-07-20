export type Lang = 'en' | 'zh';

import { nationName } from './nations';

const LANG_KEY = 'coastal-artillery-lang';

export let lang: Lang = (() => {
  try {
    return localStorage.getItem(LANG_KEY) === 'zh' ? 'zh' : 'en';
  } catch { return 'en'; }
})();

export function toggleLang() {
  lang = lang === 'en' ? 'zh' : 'en';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
}

const UI: Record<string, [string, string]> = {
  tagline: ['Three eras of naval warfare. One coastline to hold.', '三个时代的海上战争，一条必须守住的海岸线。'],
  clickStart: ['— CLICK TO START —', '— 点击开始 —'],
  langBtn: ['语言: EN / 中文', 'Language: 中文 / EN'],
  selectCampaign: ['SELECT CAMPAIGN', '选择战役'],
  lockedHint: ['🔒 Complete previous stages', '🔒 先通过之前的关卡'],
  flagshipBattle: ['Flagship battle', '旗舰决战'],
  navalAssault: ['Naval assault', '海上突击'],
  controlsMenu: ['Controls: ←/→ or A/D scroll · click buttons to build · M mute', '操作：←/→ 或 A/D 移动视角 · 点击按钮出兵建造 · M 静音'],
  base: ['BASE', '我方基地'],
  enemy: ['ENEMY', '敌方基地'],
  score: ['SCORE', '得分'],
  res: ['RES', '资源'],
  placeHint: ['Click a slot on your cliff to install', '点击我方崖壁上的炮位进行安装'],
  radarLabel: ['RADAR — click / drag to move view', '雷达 — 点击/拖动移动视角'],
  radarControls: ['A/D scroll · wheel · R-drag pan · Q/E jump to base', 'A/D 移动 · 滚轮 · 右键拖动 · Q/E 跳到基地'],
  victory: ['VICTORY', '胜利'],
  defeat: ['DEFEAT', '失败'],
  scoreLabel: ['Score', '得分'],
  timeLabel: ['Time', '用时'],
  nextStage: ['Press ENTER for next stage', '按回车进入下一关'],
  retry: ['Press ENTER to retry', '按回车重试'],
  paused: ['PAUSED', '已暂停'],
  escResume: ['ESC to resume', '按 ESC 继续'],
  msgStart: ['Destroy the enemy base — defend your coast!', '摧毁敌方基地 — 守住我方海岸！'],
  msgWave: ['Enemy wave incoming!', '敌方波次来袭！'],
  msgBoss: ['WARNING: Enemy flagship approaching!', '警告：敌方旗舰逼近！'],
  upDmg: ['DMG', '火力'],
  upRof: ['ROF', '装填'],
  upMax: ['MAX', '满级'],
  upTitle: ['UPGRADES', '武器升级'],
  nationLabel: ['SELECT NATION — arsenal & bonuses', '选择国家 — 决定武器库与加成'],
  armoryBtn: ['ARMORY', '装备库'],
  armoryTitle: ['ARMORY — buy & upgrade equipment with XP', '装备库 — 用经验购买与升级装备'],
  xpLabel: ['XP', '经验'],
  buyLabel: ['UNLOCK', '解锁'],
  upgradeLabel: ['UPGRADE', '升级'],
  maxLabel: ['MAX', '满级'],
  backLabel: ['← BACK', '← 返回'],
  xpEarned: ['XP earned', '获得经验'],
  lockedEquip: ['LOCKED — unlock in Armory', '未解锁 — 前往装备库购买'],
  vsLabel: ['vs', '对阵'],
};

export function t(key: keyof typeof UI): string {
  const e = UI[key];
  return lang === 'zh' ? e[1] : e[0];
}

const ZH_NAMES: Record<string, string> = {
  // ww1 units
  gunboat: '炮舰', cruiser_ww1: '巡洋舰', dreadnought: '无畏舰', uboat: 'U型潜艇',
  biplane: '双翼机', zeppelin: '齐柏林飞艇', boss_dreadnought: '超无畏舰',
  // ww2 units
  destroyer: '驱逐舰', battleship: '战列舰', carrier: '航空母舰', submarine_ww2: '潜艇',
  fighter_ww2: '战斗机', torpedo_bomber: '鱼雷机', boss_yamato: '大和级',
  pt_boat: '鱼雷艇', cruiser_ww2: '重巡洋舰', dive_bomber: '俯冲轰炸机',
  // modern units
  lcs: '濒海战斗舰', missile_destroyer: '导弹驱逐舰', aegis_cruiser: '宙斯盾巡洋舰',
  nuke_sub: '攻击核潜艇', jet_fighter: '喷气战机', uav: '察打无人机', boss_carrier: '超级航母',
  // turrets
  howitzer_ww1: '岸防榴弹炮', aa_nest_ww1: '高射机枪巢', coastal_ww2: '岸防炮台',
  flak88: '88毫米高炮', asm_mod: '岸舰导弹', ciws_mod: '近防炮',
  // eras
  ww1: '第一次世界大战', ww2: '第二次世界大战', modern: '现代战争',
  // stages
  'ww1-1': '初次接敌', 'ww1-2': '钢铁浪潮', 'ww1-3': '日德兰',
  'ww2-1': '海峡冲刺', 'ww2-2': '狼群', 'ww2-3': '太平洋风暴',
  'mod-1': '封锁', 'mod-2': '区域拒止', 'mod-3': '航母杀手',
};

const ZH_DESCS: Record<string, string> = {
  gunboat: '快速护航舰，猎杀U艇', cruiser_ww1: '火力与装甲均衡', dreadnought: '重型战列舰，缓慢但火力凶猛',
  uboat: '潜艇，免疫火炮——用深水炸弹或潜艇对付', biplane: '脆弱但敏捷的侦察战机', zeppelin: '缓慢的轰炸飞艇，大范围溅射',
  destroyer: '护航舰，猎杀潜艇', battleship: '巨炮：射程极远，装弹缓慢', carrier: '持续放出舰载战斗机',
  submarine_ww2: '远程鱼雷伏击者', fighter_ww2: '空战好手，携轻型炸弹', torpedo_bomber: '来自天空的军舰杀手',
  pt_boat: '高速鱼雷快艇，打了就跑', cruiser_ww2: '8英寸重炮，快速坚固', dive_bomber: '高空俯冲投下重磅炸弹',
  lcs: '快速多用途战舰', missile_destroyer: 'VLS导弹超视距打击', aegis_cruiser: '舰队防空与打击核心',
  nuke_sub: '无声的重鱼雷猎手', jet_fighter: '超音速制空战机', uav: '防区外精确打击无人机',
  howitzer_ww1: '远程反舰火炮', aa_nest_ww1: '速射防空机枪', coastal_ww2: '重型炮廓火炮',
  flak88: '致命防空炮', asm_mod: '反舰导弹阵地，射程极远', ciws_mod: '近程防空武器系统',
};

export function nameOf(id: string, fallback: string): string {
  const nn = nationName(id);
  if (nn) return lang === 'zh' ? nn[1] : nn[0];
  return lang === 'zh' ? ZH_NAMES[id] ?? fallback : fallback;
}

export function descOf(id: string, fallback: string): string {
  return lang === 'zh' ? ZH_DESCS[id] ?? fallback : fallback;
}

// short label for HUD buttons: first word in EN, up to 5 chars in ZH
export function shortName(id: string, fallback: string): string {
  const nn = nationName(id);
  if (lang === 'zh') {
    const n = nn ? nn[1] : ZH_NAMES[id] ?? fallback;
    return n.length > 5 ? n.slice(0, 5) : n;
  }
  const en = nn ? nn[0] : fallback;
  const words = en.split(' ');
  const pick = words.find(w => /\d/.test(w)) ?? words[0];
  return pick.toUpperCase();
}
