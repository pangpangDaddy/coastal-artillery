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
  poly(ctx, [[0, -w / 2], [len, -w * 0.32], [len, w * 0.32], [0, w / 2]]);
  ctx.restore();
}

// side-profile suggestion of a multi-gun heavy turret: two parallel barrels
function barrel2(ctx: Ctx, x: number, y: number, len: number, angle: number, w = 2.5) {
  barrel(ctx, x, y - 1.2, len, angle, w);
  barrel(ctx, x, y + 1.2, len, angle, w);
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ---- detail layer helpers ----
// Highlights/shadows are translucent so they read on any hull colour (player black, enemy red, flash white).
const HL = 'rgba(255,255,255,0.30)';
const SH = 'rgba(0,0,0,0.38)';

function tinted(ctx: Ctx, style: string, draw: () => void) {
  const prev = ctx.fillStyle;
  ctx.fillStyle = style;
  draw();
  ctx.fillStyle = prev;
}

// row of lit portholes along the hull side
function portholes(ctx: Ctx, x0: number, x1: number, y: number, step = 8) {
  tinted(ctx, HL, () => {
    for (let x = x0; x <= x1; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// thin highlight along the deck edge
function deckline(ctx: Ctx, x0: number, x1: number, y: number) {
  tinted(ctx, HL, () => ctx.fillRect(x0, y, x1 - x0, 1));
}

// dark boot-topping stripe at the waterline
function bootTop(ctx: Ctx, x0: number, x1: number, y = 2) {
  tinted(ctx, SH, () => ctx.fillRect(x0, y, x1 - x0, 2));
}

// bridge window band
function windows(ctx: Ctx, x: number, y: number, w: number) {
  tinted(ctx, HL, () => ctx.fillRect(x, y, w, 1.6));
}

// taut rigging/aerial line in silhouette colour (extends the silhouette over the sky)
function rig(ctx: Ctx, pts: number[][]) {
  const prev = ctx.strokeStyle;
  ctx.strokeStyle = ctx.fillStyle as string;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  ctx.strokeStyle = prev;
}

// All ships drawn facing +x, waterline at y=0, length ~ 100 * size.
// Each silhouette is modeled on a real warship profile.
const SHIPS: Record<string, (ctx: Ctx, aim?: number) => void> = {
  // HMS Insect-class gunboat (1915): low flat hull, tall thin funnel, boxy wheelhouse, single bow gun
  gunboat(ctx, aim = -0.1) {
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
    barrel(ctx, 28, -11, 19, aim, 2.2);
    // depth charge rack at stern
    ellipse(ctx, -37, -9, 2, 2);
    ellipse(ctx, -32, -9, 2, 2);
    // detail layer
    deckline(ctx, -36, 44, -6.5);
    portholes(ctx, -30, 38, -3, 9);
    bootTop(ctx, -37, 48);
    windows(ctx, 0, -14.5, 10);
    rig(ctx, [[16.6, -30], [-7.5, -31]]);
  },
  // SMS Emden (1908) light cruiser: ram bow, three capped funnels on a deckhouse, shielded guns, two pole masts
  cruiser(ctx, aim = -0.08) {
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
    barrel(ctx, 40, -15, 18, aim, 2.2);
    poly(ctx, [[-38, -9], [-28, -9], [-30, -15], [-36, -15]]);
    barrel(ctx, -35, -12, 16, Math.PI + 0.08, 2.2);
    // two pole masts with yards
    rect(ctx, 28, -34, 1.4, 22);
    rect(ctx, 24.5, -30, 9, 1.2);
    rect(ctx, -26, -32, 1.4, 19);
    rect(ctx, -29.5, -28, 9, 1.2);
    // detail layer
    deckline(ctx, -46, 52, -8.5);
    portholes(ctx, -42, 46, -4, 8);
    bootTop(ctx, -46, 55);
    windows(ctx, 17, -18.5, 10);
    rig(ctx, [[28.7, -34], [-25.3, -32]]);
    rig(ctx, [[28.7, -34], [56, -6]]);
    rig(ctx, [[-25.3, -32], [-46, -8]]);
  },
  // Queen Elizabeth-class super-dreadnought (1915): superfiring turret pairs fore/aft, tripod foremast, two funnels
  dreadnought(ctx, aim = -0.1) {
    poly(ctx, [[-54, -12], [52, -12], [66, -7], [64, -4], [56, 8], [-46, 8], [-52, 0]]);
    // A + B superfiring fore turrets
    poly(ctx, [[28, -12], [44, -12], [42, -19], [30, -19]]);
    barrel(ctx, 41, -16, 24, aim, 2.6);
    poly(ctx, [[17, -19], [31, -19], [29, -25], [19, -25]]);
    barrel(ctx, 28, -22, 22, aim, 2.6);
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
    // aft pole mast
    rect(ctx, -24, -34, 1.4, 22);
    // detail layer
    deckline(ctx, -50, 56, -11.5);
    portholes(ctx, -46, 50, -6, 8);
    bootTop(ctx, -50, 60);
    windows(ctx, 5, -26.5, 8);
    rig(ctx, [[8.8, -40], [-23.3, -34]]);
    rig(ctx, [[8.8, -40], [62, -7]]);
    rig(ctx, [[-23.3, -34], [-50, -10]]);
  },
  // Fletcher-class destroyer (1942): flush deck, two raked funnels, superfiring 5" mounts, torpedo tubes amidships
  destroyer(ctx, aim = -0.1) {
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
    barrel(ctx, 33, -12, 18, aim, 2);
    poly(ctx, [[16, -15], [25, -15], [24, -20], [18, -20]]);
    barrel(ctx, 23, -17.5, 16, aim, 2);
    // aft 5-inch mount
    poly(ctx, [[-36, -9], [-27, -9], [-28, -15], [-34, -15]]);
    barrel(ctx, -33, -12, 16, Math.PI + 0.1, 2);
    // mast behind bridge + DC racks at fantail
    rect(ctx, 8, -32, 1.3, 12);
    ellipse(ctx, -44, -10, 2, 2);
    ellipse(ctx, -40, -10, 2, 2);
    // detail layer
    deckline(ctx, -44, 50, -8.5);
    portholes(ctx, -40, 44, -4.5, 10);
    bootTop(ctx, -44, 56);
    windows(ctx, 11, -18.5, 11);
    rig(ctx, [[8.6, -32], [-30, -10]]);
    rig(ctx, [[8.6, -32], [54, -6]]);
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
    // detail layer
    deckline(ctx, -38, 42, -6.5);
    bootTop(ctx, -38, 44, 1);
    windows(ctx, 0, -14.5, 8);
    rig(ctx, [[-13.4, -20], [-36, -5]]);
    rig(ctx, [[-13.4, -20], [12, -15]]);
  },
  // Baltimore-class heavy cruiser (1943): long forecastle, two triple 8" turrets fore + one aft, twin funnels, tower bridge
  cruiser_ww2(ctx, aim = -0.09) {
    poly(ctx, [[-50, -11], [48, -11], [63, -6], [61, -3], [55, 7], [-44, 7], [-48, -1]]);
    // superfiring triple 8-inch turrets fore
    poly(ctx, [[22, -11], [38, -11], [36, -18], [24, -18]]);
    barrel(ctx, 34, -14.5, 22, aim, 2.2);
    poly(ctx, [[12, -18], [26, -18], [24, -24], [14, -24]]);
    barrel(ctx, 23, -21, 20, aim, 2.2);
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
    // detail layer
    deckline(ctx, -46, 52, -10.5);
    portholes(ctx, -42, 46, -5.5, 9);
    bootTop(ctx, -46, 58);
    windows(ctx, 1, -25.5, 9);
    rig(ctx, [[-20.3, -33], [5.5, -34]]);
    rig(ctx, [[-20.3, -33], [-46, -10]]);
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
    // detail layer
    deckline(ctx, -62, 62, -16.5);
    tinted(ctx, SH, () => { for (let i = 0; i < 6; i++) rect(ctx, -44 + i * 18, -10.6, 8, 2.2); });
    bootTop(ctx, -50, 58);
    windows(ctx, 17, -30.5, 8);
    rig(ctx, [[18.7, -42], [-20, -17]]);
    rig(ctx, [[18.7, -42], [56, -14]]);
  },
  // USS Freedom (LCS-1): high raked stealth bow, superstructure well forward, sloped mast, low stern mission deck
  lcs(ctx, aim = -0.1) {
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
    barrel(ctx, 34, -11, 16, aim, 2);
    // low aft mission/flight deck with hangar step
    rect(ctx, -30, -10, 20, 4);
    // detail layer
    deckline(ctx, -42, 34, -5.5);
    bootTop(ctx, -42, 52, 1);
    windows(ctx, 6, -20, 12);
    tinted(ctx, SH, () => rect(ctx, -28, -9, 14, 2.4));
  },
  // Type 055-style stealth destroyer: raked clipper bow, integrated mast tower, clean sloped slab sides
  missile_destroyer(ctx, aim = -0.06) {
    // flush-deck hull with long raked bow
    poly(ctx, [[-55, -10], [44, -10], [68, -3], [63, 7], [-49, 7], [-53, 0]]);
    // enclosed stealth gun turret
    poly(ctx, [[40, -10], [52, -10], [49, -16], [43, -16]]);
    barrel(ctx, 48, -13, 18, aim, 2);
    // wide fore VLS hatch field
    for (let i = 0; i < 5; i++) rect(ctx, 18 + i * 4, -12, 3, 2);
    // main superstructure: single sloped slab
    poly(ctx, [[-10, -10], [16, -10], [12, -24], [-6, -24]]);
    // integrated pyramid mast tower with flat radar faces
    poly(ctx, [[-3, -24], [9, -24], [6, -37], [2, -37]]);
    rect(ctx, 0, -32, 7, 1.4);
    rect(ctx, 3.4, -42, 1.4, 5);
    // sloped integrated funnel block
    poly(ctx, [[-24, -10], [-12, -10], [-14, -19], [-22, -19]]);
    // aft VLS field on deck
    for (let i = 0; i < 3; i++) rect(ctx, -33 + i * 4, -12, 3, 2);
    // hangar block + helideck lip
    poly(ctx, [[-48, -10], [-36, -10], [-37, -17], [-47, -17]]);
    rect(ctx, -53, -11, 6, 1.5);
    // detail layer
    deckline(ctx, -51, 60, -9.5);
    bootTop(ctx, -51, 64, 1);
    windows(ctx, -4, -21.5, 12);
    tinted(ctx, HL, () => rect(ctx, 0.5, -30, 5, 4));
    tinted(ctx, SH, () => rect(ctx, -46, -16, 8, 5));
  },
  // Ticonderoga-class cruiser (CG-47): long boxy superstructure, twin lattice masts, two funnels, guns + VLS fore and aft
  aegis(ctx, aim = -0.08) {
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
    barrel(ctx, 52, -13.5, 16, aim, 2);
    poly(ctx, [[-40, -11], [-32, -11], [-33, -15], [-39, -15]]);
    barrel(ctx, -38, -13, 13, Math.PI + 0.08, 2);
    // detail layer
    deckline(ctx, -50, 60, -10.5);
    bootTop(ctx, -50, 62, 1);
    windows(ctx, 12, -24.5, 11);
    tinted(ctx, HL, () => rect(ctx, -2, -22, 6, 6));
    rig(ctx, [[14.9, -44], [-17.1, -40]]);
    rig(ctx, [[14.9, -44], [58, -8]]);
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
    // detail layer
    tinted(ctx, SH, () => { for (let i = 0; i < 8; i++) rect(ctx, -33 + i * 9, -11, 4, 1.4); });
    tinted(ctx, SH, () => rect(ctx, -34, 1, 68, 2));
    rig(ctx, [[48, -6], [1.7, -28], [-46, -3]]);
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
    // detail layer
    deckline(ctx, -34, 42, -11);
    tinted(ctx, SH, () => rect(ctx, -34, 2, 74, 2.4));
    tinted(ctx, SH, () => { for (let i = 0; i < 5; i++) rect(ctx, -26 + i * 12, -6, 6, 1.4); });
  },
  // Iowa-class fast battleship (1943): long clipper bow, three triple 16" turrets, compact tower + twin funnels
  battleship_ww2(ctx, aim = -0.1) {
    poly(ctx, [[-52, -11], [40, -11], [64, -5], [62, -2], [55, 8], [-46, 8], [-50, 0]]);
    // long fine clipper bow sheer line
    poly(ctx, [[40, -11], [64, -5], [62, -2], [42, -6]]);
    // A + B superfiring triple turrets fore
    poly(ctx, [[22, -11], [38, -11], [36, -19], [24, -19]]);
    barrel2(ctx, 35, -15, 24, aim, 2.4);
    poly(ctx, [[10, -19], [24, -19], [22, -26], [12, -26]]);
    barrel2(ctx, 21, -22.5, 22, aim, 2.4);
    // Y turret aft
    poly(ctx, [[-40, -11], [-24, -11], [-26, -19], [-38, -19]]);
    barrel2(ctx, -36, -15, 22, Math.PI + 0.1, 2.4);
    // compact armored tower bridge with fire-control atop
    rect(ctx, -2, -26, 10, 15);
    rect(ctx, 0, -32, 6, 6);
    rect(ctx, 2.3, -40, 1.5, 8);
    rect(ctx, -1, -35, 8, 1.4);
    // two raked funnels close together
    poly(ctx, [[-11, -25], [-5, -25], [-3, -11], [-9, -11]]);
    poly(ctx, [[-20, -24], [-14, -24], [-12, -11], [-18, -11]]);
    // secondary 5-inch mounts + AA tubs
    rect(ctx, 12, -14, 6, 3);
    barrel(ctx, 15, -13, 9, 0.25, 1.4);
    rect(ctx, -23, -14, 6, 3);
    barrel(ctx, -20, -13, 9, Math.PI - 0.25, 1.4);
    // detail layer
    deckline(ctx, -48, 40, -10.5);
    portholes(ctx, -44, 36, -6, 9);
    bootTop(ctx, -48, 58);
    windows(ctx, -1, -24.5, 8);
    rig(ctx, [[3, -40], [-30, -12]]);
    rig(ctx, [[3, -40], [58, -5]]);
  },
  // BOSS super dreadnought (HMS Agincourt, 1913): flush deck crammed with turrets, two funnels, twin tripod masts
  super_dreadnought(ctx, aim = -0.1) {
    poly(ctx, [[-56, -12], [52, -12], [68, -7], [66, -4], [58, 9], [-50, 9], [-54, 0]]);
    // four visible turrets: superfiring pair fore, pair aft
    poly(ctx, [[28, -12], [44, -12], [42, -19], [30, -19]]);
    barrel2(ctx, 41, -16, 24, aim, 2.5);
    poly(ctx, [[16, -19], [30, -19], [28, -25], [18, -25]]);
    barrel2(ctx, 27, -22, 22, aim, 2.5);
    poly(ctx, [[-30, -12], [-16, -12], [-18, -19], [-28, -19]]);
    barrel2(ctx, -26, -16, 20, Math.PI + 0.1, 2.5);
    poly(ctx, [[-48, -12], [-34, -12], [-36, -19], [-46, -19]]);
    barrel2(ctx, -44, -16, 22, Math.PI + 0.1, 2.5);
    // amidships Q turret between funnels
    poly(ctx, [[-8, -12], [4, -12], [2, -18], [-6, -18]]);
    barrel2(ctx, 1, -15, 18, aim, 2.2);
    // bridge + fore tripod with spotting top
    rect(ctx, 6, -28, 9, 16);
    rect(ctx, 9.5, -44, 1.8, 30);
    poly(ctx, [[9.5, -30], [5, -30], [8.8, -42]]);
    rect(ctx, 6.5, -42, 8, 4);
    // two tall capped funnels
    rect(ctx, -4, -33, 7, 21); rect(ctx, -5, -34, 9, 2);
    rect(ctx, -14, -31, 7, 19); rect(ctx, -15, -32, 9, 2);
    // aft tripod mast
    rect(ctx, -32, -36, 1.6, 17);
    rect(ctx, -35, -33, 8, 3);
    // detail layer
    deckline(ctx, -52, 56, -11.5);
    portholes(ctx, -48, 52, -7, 8);
    portholes(ctx, -44, 48, -3, 10);
    bootTop(ctx, -52, 64);
    windows(ctx, 7, -26.5, 7);
    rig(ctx, [[10.4, -44], [-31.2, -36]]);
    rig(ctx, [[10.4, -44], [64, -7]]);
    rig(ctx, [[-31.2, -36], [-52, -10]]);
  },
  // Gato-class fleet submarine (1942): long low casing, tall shears on the fairwater, deck gun fore + AA aft
  fleet_sub(ctx) {
    ellipse(ctx, 0, -3, 48, 7);
    // long free-flooding deck casing with limber-hole hint
    poly(ctx, [[-42, -12], [40, -12], [46, -9], [-44, -9]]);
    rect(ctx, -34, -10.5, 20, 1);
    rect(ctx, 12, -10.5, 20, 1);
    // fairwater with covered navigation bridge + tall periscope shears
    poly(ctx, [[-6, -12], [10, -12], [8, -21], [-4, -21]]);
    rect(ctx, -1, -26, 4, 5);
    rect(ctx, 0, -32, 1.4, 7);
    rect(ctx, 3, -30, 1.4, 5);
    rect(ctx, 5.8, -28, 1.4, 3);
    // 4-inch deck gun forward + 40mm AA aft of the sail
    rect(ctx, 20, -14, 5, 2.5);
    barrel(ctx, 23, -13.5, 13, -0.12, 1.8);
    rect(ctx, -14, -13, 4, 2);
    barrel(ctx, -12, -13, 8, Math.PI - 0.5, 1.2);
    // bow buoyancy tank + tapered stern
    poly(ctx, [[44, -9], [54, -4], [46, 1]]);
    poly(ctx, [[-46, -7], [-54, -2], [-46, 2]]);
    // detail layer
    tinted(ctx, SH, () => { for (let i = 0; i < 9; i++) rect(ctx, -39 + i * 9, -8.4, 4, 1.4); });
    tinted(ctx, SH, () => rect(ctx, -40, 1, 80, 2));
    rig(ctx, [[52, -5], [0.7, -32], [-52, -3]]);
  },
  // BOSS Yamato (1941): massive beamy hull, three triple 46cm turrets, iconic seven-tier pagoda tower bridge
  yamato(ctx, aim = -0.1) {
    poly(ctx, [[-58, -13], [54, -13], [70, -7], [68, -3], [60, 9], [-50, 9], [-56, 0]]);
    // flared clipper bow with bulbous forefoot
    poly(ctx, [[54, -13], [70, -7], [68, -3], [56, -3]]);
    ellipse(ctx, 66, 2, 4, 3);
    // A + B superfiring triple turrets fore
    poly(ctx, [[30, -13], [47, -13], [45, -21], [32, -21]]);
    barrel2(ctx, 44, -17, 26, aim, 2.6);
    poly(ctx, [[18, -21], [33, -21], [31, -28], [20, -28]]);
    barrel2(ctx, 30, -24, 24, aim, 2.6);
    // Y triple turret aft
    poly(ctx, [[-46, -13], [-29, -13], [-31, -21], [-44, -21]]);
    barrel2(ctx, -42, -17, 24, Math.PI + 0.1, 2.6);
    // seven-tier pagoda tower bridge
    rect(ctx, 0, -20, 12, 7);
    rect(ctx, 1, -26, 10, 6);
    rect(ctx, 2, -31, 8, 5);
    rect(ctx, 3, -35, 6, 4);
    rect(ctx, 4, -39, 4.5, 4);
    rect(ctx, 5, -43, 3, 4);
    rect(ctx, 5.8, -50, 1.4, 7);
    // twin raked funnels aft of the pagoda
    poly(ctx, [[-10, -28], [-3, -28], [-1, -13], [-8, -13]]);
    poly(ctx, [[-20, -26], [-13, -26], [-11, -13], [-18, -13]]);
    // aft superstructure + secondary guns
    rect(ctx, -28, -18, 8, 5);
    barrel(ctx, -25, -16, 10, Math.PI + 0.2, 1.5);
    barrel(ctx, 16, -14, 10, 0.2, 1.5);
    // waterline belt armor hint
    rect(ctx, -46, -4, 100, 1.4);
    // detail layer
    deckline(ctx, -54, 58, -12.5);
    portholes(ctx, -50, 54, -8, 9);
    portholes(ctx, -46, 50, -4.5, 11);
    bootTop(ctx, -54, 66);
    windows(ctx, 2, -29.5, 7);
    windows(ctx, 4, -37.5, 4);
    rig(ctx, [[6.5, -50], [-27, -18]]);
    rig(ctx, [[6.5, -50], [64, -8]]);
  },
  // BOSS nuclear supercarrier: angled flight deck, small aft island, CIWS sponsons, parked jets
  supercarrier(ctx) {
    poly(ctx, [[-56, -9], [54, -9], [64, -4], [58, 7], [-50, 7], [-56, 0]]);
    // hangar side with elevator openings
    rect(ctx, -54, -12, 112, 3);
    rect(ctx, -34, -12, 12, 3);
    rect(ctx, 6, -12, 12, 3);
    // flight deck: long overhang + angled deck sponson aft
    poly(ctx, [[-66, -17], [58, -17], [68, -13], [66, -11], [-68, -11]]);
    poly(ctx, [[-68, -17], [-40, -17], [-72, -8], [-66, -8]]);
    // compact island well aft with phased-array faces and mast
    rect(ctx, 30, -30, 16, 13);
    rect(ctx, 32, -36, 12, 6);
    poly(ctx, [[34, -36], [44, -36], [42, -46], [36, -46]]);
    rect(ctx, 38, -52, 1.5, 6);
    rect(ctx, 34, -44, 10, 1.4);
    // CIWS + sea-sparrow sponsons on deck edge
    ellipse(ctx, 56, -18, 4, 3);
    barrel(ctx, 58, -19, 10, -0.4, 1.6);
    ellipse(ctx, -60, -18, 4, 3);
    barrel(ctx, -58, -19, 10, Math.PI + 0.4, 1.6);
    // parked jets on the bow and waist
    poly(ctx, [[-52, -17], [-42, -17], [-44, -21], [-50, -21]]);
    rect(ctx, -48, -22.5, 5, 1.5);
    poly(ctx, [[-12, -17], [-2, -17], [-4, -21], [-10, -21]]);
    rect(ctx, -8, -22.5, 5, 1.5);
    poly(ctx, [[16, -17], [26, -17], [24, -21], [18, -21]]);
    // detail layer
    deckline(ctx, -66, 64, -17.5);
    tinted(ctx, HL, () => { for (let i = 0; i < 8; i++) rect(ctx, -58 + i * 15, -14.6, 7, 1); });
    tinted(ctx, SH, () => { rect(ctx, -32, -11.6, 9, 2.2); rect(ctx, 8, -11.6, 9, 2.2); });
    bootTop(ctx, -54, 60);
    windows(ctx, 33, -34.5, 10);
    windows(ctx, 32, -28.5, 12);
    rig(ctx, [[38.7, -52], [10, -18]]);
    rig(ctx, [[38.7, -52], [60, -14]]);
  },
};

// Air units drawn facing +x, center at origin (side profiles)
const AIR: Record<string, (ctx: Ctx) => void> = {
  biplane(ctx) {
    // fuselage tapering to tail
    poly(ctx, [[24, -1], [20, -3], [-16, -3], [-26, -1], [-26, 1], [-16, 3], [20, 3]]);
    // round engine cowling
    ellipse(ctx, 20, 0, 4.5, 3.6);
    // upper + lower wings (staggered, airfoil cross-sections) with struts
    rect(ctx, -6, -13, 24, 3);
    rect(ctx, -8, 4, 22, 3);
    rect(ctx, -2, -13, 1.5, 17);
    rect(ctx, 10, -13, 1.5, 17);
    // interplane bracing wires
    rig(ctx, [[-1.5, -10], [11, 4]]);
    rig(ctx, [[11, -10], [-1.5, 4]]);
    // cockpit with windscreen + headrest fairing
    poly(ctx, [[2, -3], [0, -7], [-6, -7], [-8, -3]]);
    poly(ctx, [[-8, -3], [-14, -3], [-9, -5]]);
    // tail fin + rounded rudder + tailplane
    poly(ctx, [[-22, -2], [-28, -11], [-31, -10], [-30, -3], [-26, -1]]);
    rect(ctx, -32, -2, 9, 2.5);
    // kingpost aerial wire to the tail
    rig(ctx, [[4, -13], [-28, -3]]);
    // propeller + wheels with axle strut + tail skid
    rect(ctx, 24, -8, 2, 16);
    rect(ctx, 4, 3, 1.2, 6);
    rect(ctx, 11, 3, 1.2, 6);
    ellipse(ctx, 4, 9, 2.5, 2.5);
    ellipse(ctx, 11, 9, 2.5, 2.5);
    poly(ctx, [[-24, 1], [-28, 5], [-26, 5]]);
    // detail: canopy rim glint + fuselage roundel + cowling shine
    tinted(ctx, HL, () => rect(ctx, -6, -6.5, 7, 1.2));
    tinted(ctx, HL, () => ellipse(ctx, -16, 0, 2.2, 2.2));
    tinted(ctx, SH, () => ellipse(ctx, -16, 0, 1.1, 1.1));
    tinted(ctx, HL, () => ellipse(ctx, 21, -1.4, 2, 1));
  },
  // Fokker Dr.I style triplane: three stacked wings, stubby fuselage, twin guns over the cowling
  triplane(ctx) {
    // short stubby fuselage
    poly(ctx, [[20, -1], [16, -3.5], [-14, -3], [-22, -1], [-22, 1], [-14, 3], [16, 3.5]]);
    // flat-front rotary cowling
    rect(ctx, 16, -3.5, 5, 7);
    // three stacked wings with interplane struts
    rect(ctx, -4, -15, 22, 2.6);
    rect(ctx, -6, -7.5, 22, 2.6);
    rect(ctx, -7, 3.5, 20, 2.6);
    rect(ctx, 1, -15, 1.4, 21);
    rect(ctx, 9, -15, 1.4, 21);
    // bracing wire
    rig(ctx, [[1.7, -12.4], [10, 3.5]]);
    // twin machine guns on the cowl
    rect(ctx, 8, -5.4, 9, 1.2);
    rect(ctx, 8, -6.8, 9, 1.2);
    // cockpit windscreen + headrest
    poly(ctx, [[1, -3], [-1, -6.5], [-6, -6.5], [-8, -3]]);
    poly(ctx, [[-8, -3], [-13, -3], [-9, -4.8]]);
    // balanced rudder (comma shape) + tailplane
    poly(ctx, [[-18, -2], [-23, -10], [-27, -9.5], [-26, -2.5], [-22, -1]]);
    rect(ctx, -28, -1.8, 8, 2.4);
    // propeller + wheels on axle + tail skid
    rect(ctx, 21, -7, 2, 14);
    rect(ctx, 4, 3.5, 1.2, 5);
    ellipse(ctx, 4.5, 9, 2.4, 2.4);
    poly(ctx, [[-20, 1], [-24, 4.5], [-22, 4.5]]);
    // detail: cowl face shine + fuselage cross + wing leading-edge glints
    tinted(ctx, HL, () => rect(ctx, 16.5, -3, 1.6, 6));
    tinted(ctx, HL, () => ellipse(ctx, -14, 0, 2.2, 2.2));
    tinted(ctx, SH, () => ellipse(ctx, -14, 0, 1.1, 1.1));
    tinted(ctx, HL, () => rect(ctx, -4, -14.6, 22, 1));
    tinted(ctx, HL, () => rect(ctx, -6, -7.1, 22, 1));
  },
  zeppelin(ctx) {
    ellipse(ctx, 0, 0, 56, 13);
    // blunt nose mooring cap
    ellipse(ctx, 55, 0, 3, 4);
    // cross tail fins with rudder step
    poly(ctx, [[-40, -6], [-62, -16], [-52, -3]]);
    poly(ctx, [[-40, 6], [-62, 16], [-52, 3]]);
    rect(ctx, -60, -15, 2, 30);
    // forward control gondola slung below
    poly(ctx, [[-14, 13], [10, 13], [7, 20], [-11, 20]]);
    // aft engine cars with pusher props
    ellipse(ctx, -28, 15, 5, 3);
    rect(ctx, -34.5, 11, 1.5, 8);
    ellipse(ctx, 24, 15, 5, 3);
    rect(ctx, 17.5, 11, 1.5, 8);
    // suspension rigging from envelope to cars
    rig(ctx, [[-16, 11], [-12, 18]]); rig(ctx, [[8, 11], [5, 18]]);
    rig(ctx, [[-32, 10], [-29, 13]]); rig(ctx, [[-22, 11], [-26, 13]]);
    rig(ctx, [[20, 11], [23, 13]]); rig(ctx, [[30, 10], [26, 13]]);
    // detail: envelope panel lines + top highlight + gondola windows
    tinted(ctx, SH, () => { for (let i = 0; i < 5; i++) rect(ctx, -38 + i * 19, -11.8, 1.2, 23.6); });
    tinted(ctx, HL, () => rect(ctx, -40, -11, 80, 1.4));
    tinted(ctx, SH, () => rect(ctx, -44, 9.5, 88, 1.2));
    windows(ctx, -10, 15, 18);
  },
  fighter(ctx) {
    // fuselage with spinner nose
    poly(ctx, [[27, -1], [20, -4], [-4, -5], [-22, -2], [-22, 2], [-4, 5], [20, 4], [27, 1]]);
    ellipse(ctx, 26, 0, 3, 2);
    // canopy
    poly(ctx, [[8, -5], [4, -9], [-4, -9], [-9, -5]]);
    // radiator scoop under the nose
    rect(ctx, 12, 4, 8, 2.5);
    // wing (chord seen from the side, dipping below fuselage)
    poly(ctx, [[12, 3], [-2, 4], [-9, 8], [9, 7]]);
    // tail fin + tailplane
    poly(ctx, [[-18, -2], [-25, -13], [-21, -1]]);
    rect(ctx, -27, -2, 8, 2.5);
    // aerial mast behind canopy + wire to fin tip
    rect(ctx, -6, -8, 1.2, 4);
    rig(ctx, [[-5.4, -8], [-24, -12]]);
    // propeller
    rect(ctx, 27, -9, 2, 18);
    // detail: canopy glint + spine highlight + exhaust stub row
    tinted(ctx, HL, () => poly(ctx, [[6, -5.5], [3, -8], [-2, -8], [-5, -5.5]]));
    tinted(ctx, HL, () => rect(ctx, -20, -2.6, 38, 1));
    tinted(ctx, SH, () => { for (let i = 0; i < 4; i++) rect(ctx, 13 + i * 2.4, -3.6, 1.4, 1.2); });
    tinted(ctx, SH, () => rect(ctx, 12.5, 4.6, 7, 1.2));
  },
  // P-38 style twin-boom heavy fighter: central gondola, engine boom, rockets under the wing
  heavyfighter(ctx) {
    // central crew gondola with gun nose
    poly(ctx, [[24, -1], [18, -4.5], [2, -5.5], [-6, -3], [-6, 3], [2, 5.5], [18, 4.5], [24, 1]]);
    rect(ctx, 23, -1.5, 5, 1.2);
    rect(ctx, 23, 0.5, 5, 1.2);
    // bubble canopy
    poly(ctx, [[12, -5], [8, -9.5], [0, -9.5], [-4, -5]]);
    // engine boom running back to the tail (near-side)
    poly(ctx, [[16, 2], [10, 6], [-24, 5], [-28, 3], [-28, 1], [-20, 0], [10, 1]]);
    ellipse(ctx, 14, 3.5, 4.5, 3.6);
    rect(ctx, 18, -4, 2, 15);
    // wing chord passing through gondola
    poly(ctx, [[8, 0], [-10, 1], [-17, 5], [4, 4]]);
    // twin fin + joining tailplane
    poly(ctx, [[-22, 1], [-28, -10], [-24, -10], [-19, 0]]);
    rect(ctx, -30, 0.5, 10, 2.4);
    // rocket rack under the wing
    rect(ctx, -12, 7, 14, 1.8);
    poly(ctx, [[2, 7], [5, 7.9], [2, 8.8]]);
    rect(ctx, -8, 5.2, 1.2, 2);
    rect(ctx, -1, 5.2, 1.2, 2);
    // detail: canopy glint + boom highlight + supercharger intakes + spinner shine
    tinted(ctx, HL, () => poly(ctx, [[10, -5.5], [7, -8.5], [1, -8.5], [-2, -5.5]]));
    tinted(ctx, HL, () => rect(ctx, -26, 1.4, 40, 1));
    tinted(ctx, SH, () => { for (let i = 0; i < 3; i++) rect(ctx, -2 + i * 4, 2, 2.4, 1.2); });
    tinted(ctx, HL, () => ellipse(ctx, 15.5, 2.6, 1.8, 1.1));
  },
  bomber(ctx) {
    // heavier fuselage
    poly(ctx, [[30, -1], [22, -5], [-8, -6], [-26, -2], [-26, 2], [-8, 6], [22, 5], [30, 1]]);
    // radial engine cowling ring
    ellipse(ctx, 24, 0, 5, 4.4);
    // long greenhouse canopy
    poly(ctx, [[12, -6], [8, -10], [-8, -10], [-12, -6]]);
    // rear gunner position step
    poly(ctx, [[-8, -6], [-8, -9], [-13, -9], [-15, -6]]);
    // wing
    poly(ctx, [[14, 4], [-4, 5], [-12, 10], [10, 8]]);
    // tail fin + tailplane
    poly(ctx, [[-21, -3], [-29, -15], [-24, -2]]);
    rect(ctx, -31, -2, 9, 3);
    // aerial mast + wire back to fin
    rect(ctx, 10, -9, 1.2, 3);
    rig(ctx, [[10.6, -9], [-28, -14]]);
    // propeller
    rect(ctx, 30, -10, 2, 20);
    // torpedo slung under belly on cradle straps
    rect(ctx, -6, 11, 26, 4);
    poly(ctx, [[20, 11], [26, 13], [20, 15]]);
    rect(ctx, 0, 8, 1.4, 3.5);
    rect(ctx, 10, 8, 1.4, 3.5);
    // detail: greenhouse glazing bars + fuselage highlight + cowling shine
    tinted(ctx, HL, () => rect(ctx, -9, -8.6, 19, 1.2));
    tinted(ctx, SH, () => { for (let i = 0; i < 4; i++) rect(ctx, -5 + i * 4.5, -9.6, 1, 3.4); });
    tinted(ctx, HL, () => rect(ctx, -22, -3, 44, 1));
    tinted(ctx, SH, () => rect(ctx, -6, 12.2, 26, 1.2));
    tinted(ctx, HL, () => ellipse(ctx, 25, -1.6, 2.2, 1.2));
  },
  // SBD Dauntless dive bomber: stout fuselage, long greenhouse canopy, big bomb on displacing cradle under belly
  divebomber(ctx) {
    poly(ctx, [[28, -1], [21, -5], [-6, -6], [-24, -2], [-24, 2], [-6, 6], [21, 5], [28, 1]]);
    // radial engine cowling
    ellipse(ctx, 22, 0, 5, 4.2);
    // long stepped canopy
    poly(ctx, [[13, -6], [9, -10], [-10, -10], [-14, -6]]);
    // wing chord
    poly(ctx, [[13, 4], [-3, 5], [-11, 9], [9, 8]]);
    // tall rounded fin + tailplane
    poly(ctx, [[-19, -3], [-26, -14], [-22, -1]]);
    rect(ctx, -29, -2, 9, 3);
    // aerial mast + wire to fin
    rect(ctx, 11, -9, 1.2, 3);
    rig(ctx, [[11.6, -9], [-25, -13]]);
    // propeller + big centreline bomb on swing cradle arms
    rect(ctx, 28, -10, 2, 20);
    ellipse(ctx, 4, 11, 9, 3);
    poly(ctx, [[13, 9], [17, 11], [13, 13]]);
    rect(ctx, 0, 6, 1.4, 4);
    rect(ctx, 8, 6, 1.4, 4);
    // detail: canopy glazing bars + perforated dive brakes + bomb band
    tinted(ctx, HL, () => rect(ctx, -10, -8.6, 20, 1.2));
    tinted(ctx, SH, () => { for (let i = 0; i < 4; i++) rect(ctx, -8 + i * 5, -9.6, 1, 3.4); });
    tinted(ctx, SH, () => { for (let i = 0; i < 5; i++) rect(ctx, -10 + i * 2.6, 7.6, 1.2, 1.2); });
    tinted(ctx, SH, () => rect(ctx, -1, 8.6, 1.6, 5));
    tinted(ctx, HL, () => ellipse(ctx, 23, -1.5, 2.2, 1.1));
  },
  jet(ctx) {
    // pointed nose, sleek fuselage
    poly(ctx, [[32, 0], [20, -4], [-6, -5], [-24, -3], [-24, 3], [-6, 5], [20, 4]]);
    // nose pitot boom
    rect(ctx, 31, -0.6, 6, 1.2);
    // canopy
    poly(ctx, [[16, -4], [10, -9], [2, -9], [-2, -4]]);
    // intake with lip under mid-body
    rect(ctx, 0, 4, 11, 3);
    poly(ctx, [[11, 4], [13, 5.5], [11, 7]]);
    // swept vertical tail + tailplane
    poly(ctx, [[-12, -4], [-18, -16], [-24, -16], [-21, -4]]);
    poly(ctx, [[-16, 2], [-26, 2], [-22, 5], [-14, 5]]);
    // wing hint + underwing missile on pylon
    poly(ctx, [[10, 3], [-8, 3], [-15, 7], [6, 6]]);
    rect(ctx, -4, 6.5, 1.4, 2);
    rect(ctx, -9, 8.5, 12, 1.8);
    poly(ctx, [[3, 8.5], [6, 9.4], [3, 10.3]]);
    // exhaust nozzle
    rect(ctx, -27, -2, 4, 5);
    // detail: bubble canopy glint + intake lip + panel line + nozzle shading
    tinted(ctx, HL, () => poly(ctx, [[14, -4.5], [9, -8], [3, -8], [0, -4.5]]));
    tinted(ctx, HL, () => rect(ctx, 0.5, 4.4, 10, 1));
    tinted(ctx, SH, () => rect(ctx, 18, -3.4, 1.2, 7));
    tinted(ctx, HL, () => rect(ctx, -22, -3.4, 36, 1));
    tinted(ctx, SH, () => rect(ctx, -26.4, -1.4, 2.8, 3.8));
  },
  // 5th-gen stealth fighter: faceted chined nose, blended angular body, canted twin tails, no round shapes
  stealth(ctx) {
    // chined faceted fuselage
    poly(ctx, [[34, 0], [22, -3.5], [4, -5], [-16, -4], [-26, -2.5], [-26, 2.5], [-12, 4.5], [10, 4.5], [24, 2.5]]);
    // faceted low-profile canopy
    poly(ctx, [[18, -3.8], [12, -7.5], [4, -7.5], [-1, -4.2]]);
    // canted twin tails (near + far, offset)
    poly(ctx, [[-13, -4], [-18, -14], [-23, -13], [-22, -3.8]]);
    poly(ctx, [[-17, -3.5], [-22, -11.5], [-25, -11], [-24, -3]]);
    // blended wing chord
    poly(ctx, [[12, 2.5], [-8, 3], [-16, 7], [4, 6]]);
    // stabilator
    poly(ctx, [[-18, 2.5], [-28, 3], [-24, 6], [-15, 5.5]]);
    // diverterless intake bump
    poly(ctx, [[8, 4.5], [14, 4.5], [12, 6.5], [9, 6.5]]);
    // internal weapon bay outline + cracked-open door hint
    tinted(ctx, SH, () => rect(ctx, -6, 3.6, 16, 1));
    poly(ctx, [[-2, 4.5], [4, 4.5], [3, 6], [-1, 6]]);
    // sawtooth exhaust
    poly(ctx, [[-26, -2.5], [-30, -1.5], [-26, -0.5], [-30, 0.5], [-26, 1.5], [-30, 2.5], [-26, 2.5]]);
    // detail: canopy glint + chine line + panel facets
    tinted(ctx, HL, () => poly(ctx, [[16, -4], [11, -6.8], [5, -6.8], [1, -4.4]]));
    tinted(ctx, HL, () => rect(ctx, -24, -1, 54, 0.9));
    tinted(ctx, SH, () => poly(ctx, [[24, -1], [20, -2.8], [18, -1]]));
    tinted(ctx, SH, () => rect(ctx, -10, -3.2, 1, 6.5));
  },
  // MQ-9 Reaper: bulged sensor nose, long straight wing, V-tail, rear pusher propeller
  uav(ctx) {
    // fuselage with bulged satcom nose fairing
    poly(ctx, [[20, -1], [14, -4], [-18, -3], [-24, -1], [-24, 1], [-18, 3], [14, 3], [20, 1]]);
    ellipse(ctx, 16, -1.5, 7, 4.5);
    // chin sensor turret ball on mount stub
    rect(ctx, 9, 2.5, 3, 2);
    ellipse(ctx, 10, 4.5, 3.5, 3.5);
    // long high-aspect wing with upturned winglet tips
    rect(ctx, -30, -2.5, 24, 2.2);
    rect(ctx, 2, -2.5, 26, 2.2);
    poly(ctx, [[-30, -2.5], [-33, -6], [-31.5, -6], [-28, -2.5]]);
    poly(ctx, [[28, -2.5], [31, -6], [29.5, -6], [26, -2.5]]);
    // V-tail (upper) + ventral fin + tail bumper skid
    poly(ctx, [[-18, -2], [-28, -12], [-23, -12], [-15, -3]]);
    poly(ctx, [[-18, 2], [-25, 9], [-21, 9], [-14, 3]]);
    poly(ctx, [[-22, 1], [-25, 4], [-23, 4]]);
    // pusher prop disc behind tail
    rect(ctx, -27, -8, 1.8, 16);
    // wing-hardpoint missiles on pylons
    rect(ctx, 8, -0.6, 1.2, 1.6);
    rect(ctx, -13, -0.6, 1.2, 1.6);
    rect(ctx, 6, 0.5, 8, 1.6);
    rect(ctx, -16, 0.5, 8, 1.6);
    poly(ctx, [[14, 0.5], [16, 1.3], [14, 2.1]]);
    poly(ctx, [[-8, 0.5], [-6, 1.3], [-8, 2.1]]);
    // detail: sensor lens glint + satcom dome highlight + fuselage panel line
    tinted(ctx, HL, () => ellipse(ctx, 11, 4, 1.3, 1.3));
    tinted(ctx, HL, () => rect(ctx, 11, -4.6, 8, 1.2));
    tinted(ctx, SH, () => rect(ctx, 8.5, -3.4, 1, 6));
    tinted(ctx, HL, () => rect(ctx, -22, -1.6, 34, 0.9));
  },
};

// Turrets: drawn on cliff, barrel pivot at (0, -10)
const TURRETS: Record<string, (ctx: Ctx, aim: number) => void> = {
  turret_gun(ctx, aim) {
    poly(ctx, [[-22, 0], [22, 0], [16, -16], [-16, -16]]);
    rect(ctx, -10, -22, 20, 6);
    barrel(ctx, 0, -18, 34, aim, 4);
    tinted(ctx, HL, () => rect(ctx, -7, -20.5, 14, 1.4));
    tinted(ctx, SH, () => rect(ctx, -20, -2, 40, 2));
  },
  turret_aa(ctx, aim) {
    poly(ctx, [[-16, 0], [16, 0], [12, -10], [-12, -10]]);
    barrel(ctx, -4, -10, 26, aim - 0.06, 3);
    barrel(ctx, 4, -10, 26, aim + 0.06, 3);
    tinted(ctx, SH, () => rect(ctx, -14, -2, 28, 2));
  },
  turret_missile(ctx, aim) {
    rect(ctx, -20, -14, 40, 14);
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(aim);
    for (let i = 0; i < 4; i++) rect(ctx, 0, -14 + i * 8, 26, 6);
    ctx.restore();
    tinted(ctx, HL, () => rect(ctx, -16, -11, 32, 1.4));
    tinted(ctx, SH, () => rect(ctx, -18, -2, 36, 2));
  },
  turret_ciws(ctx, aim) {
    poly(ctx, [[-14, 0], [14, 0], [10, -12], [-10, -12]]);
    ellipse(ctx, 0, -14, 8, 7);
    barrel(ctx, 4, -14, 24, aim, 3);
    tinted(ctx, HL, () => ellipse(ctx, -2, -17, 2.4, 2));
    tinted(ctx, SH, () => rect(ctx, -12, -2, 24, 2));
  },
};

export function drawUnitSilhouette(ctx: Ctx, key: string, layer: string, x: number, y: number, size: number, facing: 1 | -1, color: string, aim?: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = layer === 'air' ? AIR[key] : SHIPS[key];
  if (fn) fn(ctx, aim); else { rect(ctx, -30, -12, 60, 12); }
  ctx.restore();
}

export function drawTurretSilhouette(ctx: Ctx, key: string, x: number, y: number, size: number, facing: 1 | -1, color: string, aimAngle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing * size, size);
  ctx.fillStyle = color;
  const fn = TURRETS[key];
  if (fn) fn(ctx, aimAngle);
  ctx.restore();
}

export function drawTurretIcon(ctx: Ctx, key: string, x: number, y: number, size: number, color: string) {
  drawTurretSilhouette(ctx, key, x, y, size, 1, color, -0.5);
}
