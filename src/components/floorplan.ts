// Marx Library, 2nd floor, traced from a hand sketch (north is up). One unit = one sketch pixel,
// shifted so the plan starts at 0,0. The sonar target lives on the server (config.sonar).
// shortcut: rough trace from a sketch, not a survey; redo against a real plan if one turns up.
const OX = 285, OY = 165;
const GLOBE_X = 365 - OX, GLOBE_Y = 790 - OY;
export type Rect = { x: number; y: number; w: number; h: number; label?: string; height?: number };
const r = (x1: number, y1: number, x2: number, y2: number, label?: string, height = 24): Rect =>
  ({ x: x1 - OX, y: y1 - OY, w: x2 - x1, h: y2 - y1, label, height });
const p = (x: number, y: number) => ({ x: x - OX, y: y - OY });

export const PLAN_W = 820, PLAN_H = 820;
export const START = p(690, 930); // scanner starts at the south end of the hall

// Floor you can stand on.
export const FLOORS: Rect[] = [
  r(285, 665, 1090, 975), // south hall
  r(440, 395, 545, 665), // corridor along the west side of the stairwell
];
// North wing has rounded corners, so it is a polygon.
export const WING = [p(440, 400), p(440, 270), p(470, 195), p(525, 168), p(865, 168), p(915, 200), p(950, 255), p(950, 400)];
// Places you cannot walk: stairwell and open void, rooms, elevators.
export const BLOCKED: Rect[] = [
  r(545, 400, 1030, 665, "Staircase", 0),
  r(640, 400, 740, 445, "Elevator", 40), // at the top of the staircase, opens into the north wing
  r(320, 500, 440, 655, "Open to 1st floor", 0),
  r(320, 395, 440, 500, "Office", 40),
  r(855, 165, 950, 400, "Study rooms", 40),
  r(320, 690, 440, 740, "Elevator", 40), // west end of the south hall
];
// Furniture (visual only).
export const SHELVES: Rect[] = [
  r(455, 240, 482, 355, undefined, 40), r(515, 250, 542, 370, undefined, 40),
  ...[590, 665, 740, 825, 900, 995].map((x) => r(x - 20, 820, x + 20, 915, undefined, 40)),
];
export const BOOKSTAND: Rect = r(570, 322, 630, 372, "Bookstand", 12);
export const DIVIDERS: Rect[] = [r(698, 690, 706, 760, undefined, 70), r(822, 705, 830, 770, undefined, 70)];
export const PILLARS = [p(490, 205), p(575, 205), p(635, 205), p(720, 200), p(805, 200), p(410, 865)];
export const GLOBE = p(365, 790);
// Landmarks players can orient by.
export const DOORS: Rect[] = [r(455, 968, 530, 992, "Entrance", 6), r(447, 690, 543, 730, "Doors", 6)];
export const LABELS = [{ ...p(770, 385), text: "Top of stairs" }, { ...p(GLOBE_X, GLOBE_Y - 40), text: "Globe" }];
export const TABLES = [p(620, 268), p(695, 266), p(775, 270), p(725, 320), p(698, 355), p(800, 348), p(630, 745), p(760, 740), p(905, 740)];

const inRect = (x: number, y: number, b: Rect) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
function inWing(x: number, y: number) {
  let inside = false;
  for (let i = 0, j = WING.length - 1; i < WING.length; j = i++) {
    const a = WING[i], b = WING[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export const walkable = (x: number, y: number) =>
  (FLOORS.some((f) => inRect(x, y, f)) || inWing(x, y)) && !BLOCKED.some((b) => inRect(x, y, b));
