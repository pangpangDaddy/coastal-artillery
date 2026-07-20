export type NationId = 'china' | 'usa' | 'japan' | 'uk' | 'ussr';

export interface NationDef {
  id: NationId;
  name: [string, string]; // [en, zh]
  color: string;
  // player-side stat multipliers
  dmg: number;    // weapon damage
  reload: number; // reload time (lower = faster)
  hp: number;     // unit/turret hp
  cost: number;   // purchase cost
  trait: [string, string];
}

export const NATIONS: NationDef[] = [
  {
    id: 'china', name: ['CHINA', '中国'], color: '#d4433b',
    dmg: 1.0, reload: 1.0, hp: 1.0, cost: 0.9,
    trait: ['-10% cost', '造价 -10%'],
  },
  {
    id: 'usa', name: ['USA', '美国'], color: '#4a6fb5',
    dmg: 1.1, reload: 1.0, hp: 1.0, cost: 1.05,
    trait: ['+10% damage, +5% cost', '火力 +10%，造价 +5%'],
  },
  {
    id: 'japan', name: ['JAPAN', '日本'], color: '#c05a78',
    dmg: 1.15, reload: 0.95, hp: 0.85, cost: 1.0,
    trait: ['+15% dmg, faster reload, -15% HP', '火力 +15%，装填更快，耐久 -15%'],
  },
  {
    id: 'uk', name: ['UK', '英国'], color: '#3f8a72',
    dmg: 0.95, reload: 1.0, hp: 1.2, cost: 1.0,
    trait: ['+20% HP, -5% damage', '耐久 +20%，火力 -5%'],
  },
  {
    id: 'ussr', name: ['USSR', '苏联'], color: '#b0682f',
    dmg: 1.2, reload: 1.15, hp: 1.1, cost: 1.1,
    trait: ['+20% dmg, +10% HP, slow reload', '火力 +20%，耐久 +10%，装填慢'],
  },
];

const NATION_KEY = 'coastal-artillery-nation';

let current: NationDef = (() => {
  try {
    const v = localStorage.getItem(NATION_KEY);
    return NATIONS.find(n => n.id === v) ?? NATIONS[0];
  } catch { return NATIONS[0]; }
})();

export function getNation(): NationDef { return current; }

export function setNation(id: NationId) {
  current = NATIONS.find(n => n.id === id) ?? current;
  try { localStorage.setItem(NATION_KEY, current.id); } catch { /* ignore */ }
}

// Per-nation display names for unit/turret archetypes: [en, zh]
export const NATION_NAMES: Record<NationId, Record<string, [string, string]>> = {
  china: {
    gunboat: ['Chu Gunboat', '楚级炮舰'], cruiser_ww1: ['Hai Chi', '海圻巡洋舰'],
    dreadnought: ['Hai Tien', '海天主力舰'], uboat: ['Type-A Sub', '甲型潜艇'],
    biplane: ['Caudron G.3', '高德隆双翼机'], zeppelin: ['Recon Airship', '侦察飞艇'],
    boss_dreadnought: ['Lung Wei', '龙威旗舰'],
    pt_boat: ['Torpedo Boat', '鱼雷快艇'], destroyer: ['Chien Kang', '建康驱逐舰'],
    cruiser_ww2: ['Ning Hai', '宁海巡洋舰'], battleship: ['Ping Hai', '平海战列舰'],
    carrier: ['Escort Carrier', '护航航母'], submarine_ww2: ['Type-S Sub', 'S型潜艇'],
    fighter_ww2: ['Hawk III', '霍克III战斗机'], dive_bomber: ['A-12 Shrike', '伯劳攻击机'],
    torpedo_bomber: ['TB Squadron', '鱼雷轰炸机'], boss_yamato: ['Chung Shan', '中山旗舰'],
    lcs: ['Type 056A', '056A护卫舰'], missile_destroyer: ['Type 052D', '052D驱逐舰'],
    aegis_cruiser: ['Type 055', '055大驱'], nuke_sub: ['Type 093B', '093B核潜艇'],
    jet_fighter: ['J-35', '歼-35战机'], uav: ['GJ-11', '攻击-11无人机'],
    boss_carrier: ['Fujian CV-18', '福建号航母'],
    howitzer_ww1: ['Krupp Coastal', '克虏伯岸炮'], aa_nest_ww1: ['Maxim AA Nest', '马克沁高射巢'],
    coastal_ww2: ['Bofors Battery', '博福斯岸炮'], flak88: ['76mm AA', '76毫米高炮'],
    asm_mod: ['YJ-12B', '鹰击-12B导弹'], ciws_mod: ['Type 1130', '1130近防炮'],
  },
  usa: {
    gunboat: ['Sacramento', '萨克拉门托炮舰'], cruiser_ww1: ['Chester', '切斯特巡洋舰'],
    dreadnought: ['Nevada', '内华达战列舰'], uboat: ['L-class Sub', 'L级潜艇'],
    biplane: ['Curtiss JN-4', '柯蒂斯双翼机'], zeppelin: ['DN-1 Airship', 'DN-1飞艇'],
    boss_dreadnought: ['USS Pennsylvania', '宾夕法尼亚号'],
    pt_boat: ['PT-109', 'PT鱼雷艇'], destroyer: ['Fletcher', '弗莱彻驱逐舰'],
    cruiser_ww2: ['Baltimore', '巴尔的摩重巡'], battleship: ['Iowa', '衣阿华战列舰'],
    carrier: ['Essex', '埃塞克斯航母'], submarine_ww2: ['Gato', '小鲨鱼潜艇'],
    fighter_ww2: ['F4U Corsair', '海盗战斗机'], dive_bomber: ['SBD Dauntless', '无畏俯冲轰炸机'],
    torpedo_bomber: ['TBF Avenger', '复仇者鱼雷机'], boss_yamato: ['USS Missouri', '密苏里号'],
    lcs: ['Freedom LCS', '自由级濒海舰'], missile_destroyer: ['Arleigh Burke', '伯克级驱逐舰'],
    aegis_cruiser: ['Ticonderoga', '提康德罗加巡洋舰'], nuke_sub: ['Virginia SSN', '弗吉尼亚核潜艇'],
    jet_fighter: ['F-35C', 'F-35C战机'], uav: ['MQ-9 Reaper', '死神无人机'],
    boss_carrier: ['USS Ford', '福特号航母'],
    howitzer_ww1: ['M1918 Coastal', 'M1918岸炮'], aa_nest_ww1: ['M1917 AA MG', 'M1917高射机枪'],
    coastal_ww2: ['16in Battery', '16英寸岸炮'], flak88: ['90mm AA', '90毫米高炮'],
    asm_mod: ['NSM Battery', 'NSM岸舰导弹'], ciws_mod: ['Phalanx CIWS', '密集阵近防炮'],
  },
  japan: {
    gunboat: ['Saga Gunboat', '嵯峨炮舰'], cruiser_ww1: ['Chikuma', '筑摩巡洋舰'],
    dreadnought: ['Fuso', '扶桑战列舰'], uboat: ['Ro-class Sub', '吕号潜艇'],
    biplane: ['Yokosho Seaplane', '横厂水上机'], zeppelin: ['Navy Airship', '海军飞行船'],
    boss_dreadnought: ['Nagato', '长门旗舰'],
    pt_boat: ['Gyoraitei', '甲标的快艇'], destroyer: ['Kagero', '阳炎驱逐舰'],
    cruiser_ww2: ['Takao', '高雄重巡'], battleship: ['Yamato', '大和战列舰'],
    carrier: ['Akagi', '赤城航母'], submarine_ww2: ['I-Go Sub', '伊号潜艇'],
    fighter_ww2: ['A6M Zero', '零式战斗机'], dive_bomber: ['D3A Val', '九九舰爆'],
    torpedo_bomber: ['B5N Kate', '九七舰攻'], boss_yamato: ['Musashi', '武藏旗舰'],
    lcs: ['Mogami FFM', '最上护卫舰'], missile_destroyer: ['Maya DDG', '摩耶驱逐舰'],
    aegis_cruiser: ['Atago DDG', '爱宕宙斯盾舰'], nuke_sub: ['Taigei SS', '大鲸潜艇'],
    jet_fighter: ['F-35B', 'F-35B战机'], uav: ['Strike UAV', '攻击无人机'],
    boss_carrier: ['Izumo DDH', '出云号航母'],
    howitzer_ww1: ['Type 45 Coastal', '四五式岸炮'], aa_nest_ww1: ['Type 3 AA MG', '三式高射机枪'],
    coastal_ww2: ['Type 96 Battery', '九六式岸炮'], flak88: ['Type 88 AA', '八八式高炮'],
    asm_mod: ['Type 12 SSM', '12式岸舰导弹'], ciws_mod: ['Phalanx CIWS', '密集阵近防炮'],
  },
  uk: {
    gunboat: ['Insect-class', '昆虫级炮舰'], cruiser_ww1: ['Town-class', '城级巡洋舰'],
    dreadnought: ['Queen Elizabeth', '女王级战列舰'], uboat: ['E-class Sub', 'E级潜艇'],
    biplane: ['Sopwith Camel', '骆驼战斗机'], zeppelin: ['Coastal Airship', '海岸飞艇'],
    boss_dreadnought: ['HMS Warspite', '厌战号旗舰'],
    pt_boat: ['Vosper MTB', '沃斯珀鱼雷艇'], destroyer: ['Tribal-class', '部族驱逐舰'],
    cruiser_ww2: ['County-class', '郡级重巡'], battleship: ['King George V', '乔治五世战列舰'],
    carrier: ['Illustrious', '光辉航母'], submarine_ww2: ['T-class Sub', 'T级潜艇'],
    fighter_ww2: ['Seafire', '海火战斗机'], dive_bomber: ['Skua', '贼鸥俯冲轰炸机'],
    torpedo_bomber: ['Swordfish', '剑鱼鱼雷机'], boss_yamato: ['HMS Hood', '胡德号旗舰'],
    lcs: ['River OPV', '河级巡逻舰'], missile_destroyer: ['Type 45', '45型驱逐舰'],
    aegis_cruiser: ['Type 83', '83型巡洋舰'], nuke_sub: ['Astute SSN', '机敏级核潜艇'],
    jet_fighter: ['F-35B', 'F-35B战机'], uav: ['Protector RG', '保护者无人机'],
    boss_carrier: ['HMS Queen Elizabeth', '伊丽莎白女王号'],
    howitzer_ww1: ['BL 9.2in Gun', '9.2英寸岸炮'], aa_nest_ww1: ['Vickers AA MG', '维克斯高射机枪'],
    coastal_ww2: ['BL 15in Battery', '15英寸岸炮'], flak88: ['QF 3.7in AA', '3.7英寸高炮'],
    asm_mod: ['NSM Battery', 'NSM岸舰导弹'], ciws_mod: ['Goalkeeper CIWS', '守门员近防炮'],
  },
  ussr: {
    gunboat: ['Ardagan', '阿尔达甘炮舰'], cruiser_ww1: ['Aurora', '阿芙乐尔巡洋舰'],
    dreadnought: ['Gangut', '甘古特战列舰'], uboat: ['Bars-class Sub', '雪豹级潜艇'],
    biplane: ['Nieuport 17', '纽波尔战斗机'], zeppelin: ['Ilya Muromets', '伊利亚飞艇'],
    boss_dreadnought: ['Imperatritsa', '女皇号旗舰'],
    pt_boat: ['G-5 Boat', 'G-5鱼雷艇'], destroyer: ['Gnevny', '愤怒级驱逐舰'],
    cruiser_ww2: ['Kirov', '基洛夫巡洋舰'], battleship: ['Sovetsky Soyuz', '苏维埃联盟级'],
    carrier: ['Escort Carrier', '护航航母'], submarine_ww2: ['Shchuka Sub', '狗鱼级潜艇'],
    fighter_ww2: ['Yak-9', '雅克-9战斗机'], dive_bomber: ['Pe-2', '佩-2俯冲轰炸机'],
    torpedo_bomber: ['Il-4T', '伊尔-4鱼雷机'], boss_yamato: ['Sov. Rossiya', '苏维埃俄罗斯号'],
    lcs: ['Karakurt', '卡拉库尔特舰'], missile_destroyer: ['Gorshkov', '戈尔什科夫舰'],
    aegis_cruiser: ['Kirov CGN', '基洛夫核巡'], nuke_sub: ['Yasen SSN', '亚森核潜艇'],
    jet_fighter: ['Su-33', '苏-33战机'], uav: ['Orion UAV', '猎户座无人机'],
    boss_carrier: ['Adm. Kuznetsov', '库兹涅佐夫号'],
    howitzer_ww1: ['Obukhov Coastal', '奥布霍夫岸炮'], aa_nest_ww1: ['Maxim AA Nest', '马克沁高射巢'],
    coastal_ww2: ['B-13 Battery', 'B-13岸炮'], flak88: ['85mm AA', '85毫米高炮'],
    asm_mod: ['Bastion-P', '棱堡岸舰导弹'], ciws_mod: ['AK-630', 'AK-630近防炮'],
  },
};

// nation-specific display name for an archetype id, or null if none
export function nationName(id: string): [string, string] | null {
  return NATION_NAMES[current.id][id] ?? null;
}
