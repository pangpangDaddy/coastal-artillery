type Ctx = CanvasRenderingContext2D;

function poly(ctx: Ctx, pts: number[][]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
}

function rect(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.fillRect(x, y, w, h);
}

function barrel(ctx: Ctx, x: number, y: number, len: number, angle: number, w = 2.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillRect(0, -w / 2, len, w);
  ctx.restore();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// All ships drawn facing +x, waterline at y=0, length ~ 100 * size.
// Each silhouette is modeled on a real warship profile.
const SHIPS: Record<string, (ctx: Ctx) => void> = {
  // HMS Insect-class gunboat (1915): low flat hull, tall thin funnel, boxy wheelhouse, single bow gun
  gunboat(ctx) {
    poly(ctx, [[-40, -7], [42, -7], [52, -3], [50, -1], [46, 6], [-36, 6], [-40, 0]]);
    // awning deck aft
    rect(ctx, -34, -10, 26, 3);
    rect(ctx, -32, -13, 1.2, 3); rect(ctx, -24, -13, 1.2, 3); rect(ctx, -16, -13, 1.2, 3);
    // wheelhouse forward of funnel
    rect(ctx, -2, -16, 14, 9);
    rect(ctx, 0, -21, 9, 5);
    // tall thin upright funnel
    rect(ctx, -10, -30, 5, 23);
    rect(ctx, -11, -31, 7, 2);
    // pole mast fore
    rect(ctx, 16, -30, 1.3, 23);
    // 6-inch bow gun on open pedestal mount
    rect(ctx, 24, -11, 7, 4);
    barrel(ctx, 28, -11, 19, -0.1, 2.2);
    // depth charge rack at stern
    ellipse(ctx, -37, -9, 2, 2);
    ellipse(ctx, -32, -9, 2, 2);
  },
  // SMS Emden (1908) light cruiser: ram bow, three capped funnels on a deckhouse, shielded guns, two pole masts
  cruiser(ctx) {
    poly(ctx, [[-50, -9], [48, -9], [60, -5], [56, 1], [52, 7], [-44, 7], [-48, 0]]);
    // central deckhouse joining the funnels
    rect(ctx, -22, -13, 44, 4);
    // three evenly spaced funnels with caps
    rect(ctx, -18, -28, 6, 15); rect(ctx, -19, -29, 8, 2);
    rect(ctx, -7, -28, 6, 15); rect(ctx, -8, -29, 8, 2);
    rect(ctx, 4, -28, 6, 15); rect(ctx, 3, -29, 8, 2);
    // bridge forward
    rect(ctx, 16, -20, 12, 8);
    rect(ctx, 18, -24, 7, 4);
    // shielded guns fore and aft
    poly(ctx, [[32, -12], [42, -12], [40, -18], [34, -18]]);
    barrel(ctx, 40, -15, 18, -0.08, 2.2);
    poly(ctx, [[-38, -9], [-28, -9], [-30, -15], [-36, -15]]);
    barrel(ctx, -35, -12, 16, Math.PI + 0.08, 2.2);
    // two pole masts with yards
    rect(ctx, 28, -34, 1.4, 22);
    rect(ctx, 24.5, -30, 9, 1.2);
    rect(ctx, -26, -32, 1.4, 19);
    rect(ctx, -29.5, -28, 9, 1.2);
  },
  // Queen Elizabeth-class super-dreadnought (1915): superfiring turret pairs fore/aft, tripod foremast, two funnels
  dreadnought(ctx) {
    poly(ctx, [[-54, -12], [52, -12], [66, -7], [64, -4], [56, 8], [-46, 8], [-52, 0]]);
    // A + B superfiring fore turrets
    poly(ctx, [[28, -12], [44, -12], [42, -19], [30, -19]]);
    barrel(ctx, 41, -16, 24, -0.1, 2.6);
    poly(ctx, [[17, -19], [31, -19], [29, -25], [19, -25]]);
    barrel(ctx, 28, -22, 22, -0.1, 2.6);
    // X + Y superfiring aft turrets
    poly(ctx, [[-44, -12], [-28, -12], [-30, -19], [-42, -19]]);
    barrel(ctx, -41, -16, 22, Math.PI + 0.1, 2.6);
    poly(ctx, [[-33, -19], [-19, -19], [-21, -25], [-31, -25]]);
    barrel(ctx, -30, -22, 20, Math.PI + 0.1, 2.6);
    // bridge block + tripod foremast with spotting top
    rect(ctx, 4, -28, 10, 16);
    rect(ctx, 8, -40, 1.6, 28);
    rect(ctx, 5, -38, 8, 4);
    // two capped funnels
    rect(ctx, -6, -31, 7, 19); rect(ctx, -7, -32, 9, 2);
    rect(ctx, -15, -29, 6, 17); rect(ctx, -16, -30, 8, 2);
  },
  // Fletcher-class destroyer (1942): flush deck, two raked funnels, superfiring 5" mounts, torpedo tubes amidships
  destroyer(ctx) {
    poly(ctx, [[-48, -9], [46, -9], [60, -5], [58, -2], [52, 6], [-42, 6], [-46, 0]]);
    // compact bridge
    rect(ctx, 10, -20, 13, 11);
    rect(ctx, 13, -24, 8, 4);
    // two raked funnels
    poly(ctx, [[-2, -26], [4, -26], [6, -9], [0, -9]]);
    poly(ctx, [[-16, -25], [-10, -25], [-8, -9], [-14, -9]]);
    // quintuple torpedo tube mount between funnels
    rect(ctx, -8, -12, 8, 3);
    barrel(ctx, -7, -11, 9, -0.35, 1.6);
    // superfiring 5-inch mounts fore
    poly(ctx, [[26, -9], [36, -9], [34, -15], [28, -15]]);
    barrel(ctx, 33, -12, 18, -0.1, 2);
    poly(ctx, [[16, -15], [25, -15], [24, -20], [18, -20]]);
    barrel(ctx, 23, -17.5, 16, -0.1, 2);
    // aft 5-inch mount
    poly(ctx, [[-36, -9], [-27, -9], [-28, -15], [-34, -15]]);
    barrel(ctx, -33, -12, 16, Math.PI + 0.1, 2);
    // mast behind bridge + DC racks at fantail
    rect(ctx, 8, -32, 1.3, 12);
    ellipse(ctx, -44, -10, 2, 2);
    ellipse(ctx, -40, -10, 2, 2);
  },
  // Elco 80' PT boat: planing hull with hard chine, small charthouse, torpedo tubes angled outboard
  pt_boat(ctx) {
    poly(ctx, [[-42, -7], [30, -7], [50, -2], [46, 4], [-38, 4], [-42, 0]]);
    // low charthouse with windshield rake
    poly(ctx, [[-6, -7], [14, -7], [10, -16], [-2, -16]]);
    rect(ctx, -14, -20, 1.2, 13);
    // twin torpedo tubes on deck edge, angled out
    barrel(ctx, 18, -8, 16, -0.06, 3);
    barrel(ctx, -18, -8, 14, Math.PI + 0.06, 3);
    // aft AA mount
    rect(ctx, -28, -10, 6, 3);
    barrel(ctx, -25, -10, 10, -0.5, 1.4);
  },
  // Baltimore-class heavy cruiser (1943): long forecastle, two triple 8" turrets fore + one aft, twin funnels, tower bridge
  cruiser_ww2(ctx) {
    poly(ctx, [[-50, -11], [48, -11], [63, -6], [61, -3], [55, 7], [-44, 7], [-48, -1]]);
    // superfiring triple 8-inch turrets fore
    poly(ctx, [[22, -11], [38, -11], [36, -18], [24, -18]]);
    barrel(ctx, 34, -14.5, 22, -0.09, 2.2);
    poly(ctx, [[12, -18], [26, -18], [24, -24], [14, -24]]);
    barrel(ctx, 23, -21, 20, -0.09, 2.2);
    // aft turret
    poly(ctx, [[-38, -11], [-24, -11], [-26, -18], [-36, -18]]);
    barrel(ctx, -34, -14.5, 20, Math.PI + 0.09, 2.2);
    // tower bridge + fire-control top
    rect(ctx, 0, -28, 11, 17);
    rect(ctx, 3, -34, 5, 6);
    // two upright funnels
    poly(ctx, [[-8, -27], [-2, -27], [0, -11], [-6, -11]]);
    poly(ctx, [[-18, -26], [-12, -26], [-10, -11], [-16, -11]]);
    // mainmast + AA tubs
    rect(ctx, -21, -33, 1.4, 22);
    rect(ctx, 14, -14, 5, 3);
    rect(ctx, -44, -14, 5, 3);
  },
  // Essex-class carrier (1943): full-length flight deck, compact starboard island with integrated funnel and tripod mast
  carrier(ctx) {
    poly(ctx, [[-52, -8], [52, -8], [62, -3], [56, 6], [-48, 6], [-52, 0]]);
    // hangar deck side
    rect(ctx, -50, -11, 106, 3);
    // flight deck with overhang, slight bow round-down
    poly(ctx, [[-62, -16], [60, -16], [66, -13], [64, -11], [-64, -11]]);
    // island: bridge levels + funnel + tripod mast
    rect(ctx, 14, -28, 15, 12);
    rect(ctx, 16, -32, 10, 4);
    poly(ctx, [[24, -40], [28, -40], [29, -32], [23, -32]]);
    rect(ctx, 18, -42, 1.5, 10);
    poly(ctx, [[19, -32], [15, -32], [18.6, -40]]);
    rect(ctx, 13, -30, 17, 1.5);
    // parked aircraft forward on deck
    poly(ctx, [[-32, -16], [-24, -16], [-26, -20], [-30, -20]]);
    rect(ctx, -36, -17.5, 5, 1.5);
    poly(ctx, [[-44, -16], [-37, -16], [-39, -19], [-42, -19]]);
  },
  // USS Freedom (LCS-1): high raked stealth bow, superstructure well forward, sloped mast, low stern mission deck
  lcs(ctx) {
    poly(ctx, [[-46, -6], [36, -6], [44, -10], [58, -2], [50, 5], [-40, 5], [-44, 0]]);
    // high sheer bow bulwark
    poly(ctx, [[36, -6], [44, -10], [56, -3], [44, -3]]);
    // forward angular superstructure (bridge faces sloped)
    poly(ctx, [[-4, -6], [26, -6], [20, -22], [2, -22], [-2, -14]]);
    // sloped stealth mast
    poly(ctx, [[6, -22], [14, -22], [10, -33], [8, -33]]);
    rect(ctx, 4, -29, 12, 1.3);
    // 57mm enclosed stealth gun fore of bridge
    poly(ctx, [[28, -8], [38, -8], [35, -14], [30, -14]]);
    barrel(ctx, 34, -11, 16, -0.1, 2);
    // low aft mission/flight deck with hangar step
    rect(ctx, -30, -10, 20, 4);
  },
  // Arleigh Burke-class destroyer (DDG-51): flared bow, 5" gun, fore/aft VLS, slab SPY deckhouse, twin raked funnels
  missile_destroyer(ctx) {
    poly(ctx, [[-52, -10], [44, -10], [64, -6], [62, -3], [56, 7], [-46, 7], [-50, 0]]);
    // fore VLS hatch field
    for (let i = 0; i < 4; i++) rect(ctx, 24 + i * 4, -12, 3, 2);
    // 5-inch enclosed gun at bow
    poly(ctx, [[42, -10], [52, -10], [50, -15], [44, -15]]);
    barrel(ctx, 48, -12.5, 17, -0.08, 2);
    // deckhouse with sloped SPY-1 radar faces
    poly(ctx, [[-4, -10], [22, -10], [17, -25], [1, -25]]);
    rect(ctx, 3, -28, 11, 3);
    // solid pyramid mast raked aft
    poly(ctx, [[6, -28], [12, -28], [8, -40], [7, -40]]);
    rect(ctx, 3, -35, 10, 1.4);
    // twin raked funnels
    poly(ctx, [[-12, -20], [-5, -20], [-3, -10], [-10, -10]]);
    poly(ctx, [[-24, -18], [-17, -18], [-15, -10], [-22, -10]]);
    // aft deckhouse + aft VLS + helo deck
    rect(ctx, -38, -15, 12, 5);
    for (let i = 0; i < 3; i++) rect(ctx, -37 + i * 4, -17, 3, 2);
    rect(ctx, -48, -11, 9, 1.5);
  },
  // Ticonderoga-class cruiser (CG-47): long boxy superstructure, twin lattice masts, two funnels, guns + VLS fore and aft
  aegis(ctx) {
    poly(ctx, [[-54, -11], [48, -11], [66, -7], [64, -4], [58, 7], [-48, 7], [-52, 0]]);
    // continuous slab superstructure
    poly(ctx, [[-34, -11], [28, -11], [24, -26], [-30, -26]]);
    rect(ctx, 6, -30, 12, 4);
    rect(ctx, -24, -30, 12, 4);
    // twin lattice masts (fore raked, aft vertical)
    rect(ctx, 14, -44, 1.8, 14);
    rect(ctx, 10, -41, 10, 1.4);
    rect(ctx, 12, -37, 10, 1.4);
    rect(ctx, -18, -40, 1.8, 10);
    rect(ctx, -22, -37, 10, 1.4);
    // two low square funnels
    rect(ctx, 0, -29, 5, 3);
    rect(ctx, -12, -29, 5, 3);
    // fore + aft VLS hatch fields
    for (let i = 0; i < 4; i++) rect(ctx, 30 + i * 4, -13, 3, 2);
    for (let i = 0; i < 3; i++) rect(ctx, -46 + i * 4, -13, 3, 2);
    // 5-inch guns fore and aft
    poly(ctx, [[46, -11], [55, -11], [53, -16], [48, -16]]);
    barrel(ctx, 52, -13.5, 16, -0.08, 2);
    poly(ctx, [[-40, -11], [-32, -11], [-33, -15], [-39, -15]]);
    barrel(ctx, -38, -13, 13, Math.PI + 0.08, 2);
  },
  // Type VII U-boat: saddle-tank hull, stepped conning tower with AA platform, 88mm deck gun, net-cutter bow
  uboat(ctx) {
    ellipse(ctx, 0, -3, 42, 7);
    // free-flooding deck casing
    poly(ctx, [[-36, -12], [34, -12], [40, -9], [-38, -9]]);
    // conning tower with wintergarten (AA platform) aft
    poly(ctx, [[-4, -12], [10, -12], [8, -22], [-2, -22]]);
    poly(ctx, [[-10, -12], [-4, -12], [-4, -17], [-9, -17]]);
    rect(ctx, -8, -19, 1.2, 2);
    // periscopes + attack scope
    rect(ctx, 1, -28, 1.4, 6);
    rect(ctx, 4.5, -26, 1.4, 4);
    // 88mm deck gun forward of tower
    rect(ctx, 17, -14, 5, 2.5);
    barrel(ctx, 20, -13.5, 12, -0.15, 1.8);
    // bow with net cutter serration + stern taper
    poly(ctx, [[38, -9], [50, -5], [40, 1]]);
    poly(ctx, [[44, -8], [47, -6], [44, -5]]);
    poly(ctx, [[-40, -7], [-48, -2], [-40, 2]]);
  },
  // Los Angeles-class SSN: cylindrical hull with long parallel midbody, forward sail with sail planes, cruciform stern
  nuke_sub(ctx) {
    // parallel midbody + rounded bow
    rect(ctx, -34, -12, 72, 17);
    ellipse(ctx, 38, -3.5, 16, 8.5);
    // tapered stern cone
    poly(ctx, [[-34, -12], [-34, 5], [-56, -2], [-52, -5]]);
    // sail set forward, sail-mounted dive planes
    poly(ctx, [[2, -12], [18, -12], [17, -27], [4, -27]]);
    rect(ctx, -2, -21, 24, 2.2);
    // masts/periscopes
    rect(ctx, 9, -33, 1.4, 6);
    rect(ctx, 13, -31, 1.4, 4);
    // cruciform stern: upper rudder + stern plane
    poly(ctx, [[-50, -4], [-58, -15], [-54, -3]]);
    poly(ctx, [[-50, -1], [-58, 9], [-54, -1]]);
    // seven-blade prop hint
    ellipse(ctx, -57, -2.5, 1.6, 4);
  },
};

// Air units drawn facing +x, center at origin (side profiles)
const AIR: Record<string, (ctx: Ctx) => void> = {
  biplane(ctx) {
    // fuselage tapering to tail
    poly(ctx, [[24, -1], [20, -3], [-16, -3], [-26, -1], [-26, 1], [-16, 3], [20, 3]]);
    // upper + lower wings (airfoil cross-sections) with struts
    rect(ctx, -8, -13, 24, 3);
    rect(ctx, -6, 4, 22, 3);
    rect(ctx, -2, -13, 1.5, 17);
    rect(ctx, 10, -13, 1.5, 17);
    // cockpit
    poly(ctx, [[2, -3], [0, -7], [-6, -7], [-8, -3]]);
    // tail fin + tailplane
    poly(ctx, [[-22, -2], [-30, -11], [-26, -1]]);
    rect(ctx, -32, -2, 9, 2.5);
    // propeller + wheels
    rect(ctx, 24, -8, 2, 16);
    ellipse(ctx, 2, 9, 2.5, 2.5);
    ellipse(ctx, 12, 9, 2.5, 2.5);
  },
  zeppelin(ctx) {
    ellipse(ctx, 0, 0, 56, 13);
    // cross tail fins
    poly(ctx, [[-40, -6], [-62, -16], [-52, -3]]);
    poly(ctx, [[-40, 6], [-62, 16], [-52, 3]]);
    // gondola slung below
    poly(ctx, [[-14, 13], [10, 13], [7, 20], [-11, 20]]);
  },
  fighter(ctx) {
    // fuselage with spinner nose
    poly(ctx, [[27, -1], [20, -4], [-4, -5], [-22, -2], [-22, 2], [-4, 5], [20, 4], [27, 1]]);
    // canopy
    poly(ctx, [[8, -5], [4, -9], [-4, -9], [-9, -5]]);
    // wing (chord seen from the side, dipping below fuselage)
    poly(ctx, [[12, 3], [-2, 4], [-9, 8], [9, 7]]);
    // tail fin + tailplane
    poly(ctx, [[-18, -2], [-25, -13], [-21, -1]]);
    rect(ctx, -27, -2, 8, 2.5);
    // propeller
    rect(ctx, 27, -9, 2, 18);
  },
  bomber(ctx) {
    // heavier fuselage
    poly(ctx, [[30, -1], [22, -5], [-8, -6], [-26, -2], [-26, 2], [-8, 6], [22, 5], [30, 1]]);
    // long greenhouse canopy
    poly(ctx, [[12, -6], [8, -10], [-8, -10], [-12, -6]]);
    // wing
    poly(ctx, [[14, 4], [-4, 5], [-12, 10], [10, 8]]);
    // tail fin + tailplane
    poly(ctx, [[-21, -3], [-29, -15], [-24, -2]]);
    rect(ctx, -31, -2, 9, 3);
    // propeller
    rect(ctx, 30, -10, 2, 20);
    // torpedo slung under belly
    rect(ctx, -6, 11, 26, 4);
    poly(ctx, [[20, 11], [26, 13], [20, 15]]);
  },
  // SBD Dauntless dive bomber: stout fuselage, long greenhouse canopy, big bomb on displacing cradle under belly
  divebomber(ctx) {
    poly(ctx, [[28, -1], [21, -5], [-6, -6], [-24, -2], [-24, 2], [-6, 6], [21, 5], [28, 1]]);
    // long stepped canopy
    poly(ctx, [[13, -6], [9, -10], [-10, -10], [-14, -6]]);
    // wing chord
    poly(ctx, [[13, 4], [-3, 5], [-11, 9], [9, 8]]);
    // tall rounded fin + tailplane
    poly(ctx, [[-19, -3], [-26, -14], [-22, -1]]);
    rect(ctx, -29, -2, 9, 3);
    // propeller + big centreline bomb
    rect(ctx, 28, -10, 2, 20);
    ellipse(ctx, 4, 11, 9, 3);
    poly(ctx, [[13, 9], [17, 11], [13, 13]]);
  },
  jet(ctx) {
    // pointed nose, sleek fuselage
    poly(ctx, [[32, 0], [20, -4], [-6, -5], [-24, -3], [-24, 3], [-6, 5], [20, 4]]);
    // canopy
    poly(ctx, [[16, -4], [10, -9], [2, -9], [-2, -4]]);
    // intake under mid-body
    rect(ctx, 0, 4, 11, 3);
    // swept vertical tail
    poly(ctx, [[-12, -4], [-18, -16], [-24, -16], [-21, -4]]);
    // wing hint
    poly(ctx, [[10, 3], [-8, 3], [-15, 7], [6, 6]]);
    // exhaust nozzle
    rect(ctx, -27, -2, 4, 5);
  },
  // MQ-9 Reaper: bulged sensor nose, long straight wing, V-tail, rear pusher propeller
  uav(ctx) {
    // fuselage with bulged satcom nose fairing
    poly(ctx, [[20, -1], [14, -4], [-18, -3], [-24, -1], [-24, 1], [-18, 3], [14, 3], [20, 1]]);
    ellipse(ctx, 16, -1.5, 7, 4.5);
    // chin sensor turret ball
    ellipse(ctx, 10, 4.5, 3.5, 3.5);
    // long high-aspect wing across mid-fuselage
    rect(ctx, -30, -2.5, 24, 2.2);
    rect(ctx, 2, -2.5, 26, 2.2);
    // V-tail (upper) + ventral fin
    poly(ctx, [[-18, -2], [-28, -12], [-23, -12], [-15, -3]]);
    poly(ctx, [[-18, 2], [-25, 9], [-21, 9], [-14, 3]]);
    // pusher prop disc behind tail
    rect(ctx, -27, -8, 1.8, 16);
    // wing-hardpoint missiles
    rect(ctx, 6, 0.5, 8, 1.6);
    rect(ctx, -16, 0.5, 8, 1.6);
  },
};

// Turrets: drawn on cliff, barrel pivot at (0, -10)
const TURRETS: Record<string, (ctx: Ctx, aim: number) => void> = {
  turret_gun(ctx, aim) {
    poly(ctx, [[-22, 0], [22, 0], [16, -16], [-16, -16]]);
    rect(ctx, -10, -22, 20, 6);
    barrel(ctx, 0, -18, 34, aim, 4);
  },
  turret_aa(ctx, aim) {
    poly(ctx, [[-16, 0], [16, 0], [12, -10], [-12, -10]]);
    barrel(ctx, -4, -10, 26, aim - 0.06, 3);
    barrel(ctx, 4, -10, 26, aim + 0.06, 3);
  },
  turret_missile(ctx, aim) {
    rect(ctx, -20, -14, 40, 14);
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(aim);
    for (let i = 0; i < 4; i++) rect(ctx, 0, -14 + i * 8, 26, 6);
    ctx.restore();
  },
  turret_ciws(ctx, aim) {
    poly(ctx, [[-14, 0], [14, 0], [10, -12], [-10, -12]]);
    ellipse(ctx, 0, -14, 8, 7);
    barrel(ctx, 4, -14, 24, aim, 3);
  },
};

export function drawUnitSilhouette(ctx: Ctx, key: string, layer: string, x: number, y: number, size: number, facing: 1 | -1, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = layer === 'air' ? AIR[key] : SHIPS[key];
  if (fn) fn(ctx); else { rect(ctx, -30, -12, 60, 12); }
  ctx.restore();
}

export function drawTurretSilhouette(ctx: Ctx, key: string, x: number, y: number, size: number, facing: 1 | -1, color: string, aimAngle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = TURRETS[key];
  if (fn) fn(ctx, facing === 1 ? aimAngle : Math.PI - aimAngle);
  ctx.restore();
}

export function drawTurretIcon(ctx: Ctx, key: string, x: number, y: number, size: number, color: string) {
  drawTurretSilhouette(ctx, key, x, y, size, 1, color, -0.5);
}
