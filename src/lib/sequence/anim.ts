// Mutable animation state. GSAP timelines tween these numbers; the R3F scene
// reads them every frame in useFrame. Kept OUT of React state so 60fps camera
// and growth animation never trigger re-renders. One scene mounts at a time.

export interface Anim {
  grid: number;        // ground grid fade 0..1
  plot: number;        // plot outline draw 0..1
  dims: number;        // dimension labels 0..1
  roomsProgress: number; // 0..roomCount — staggered room growth
  walls: number;       // wall extrude 0..1
  openings: number;    // doors/windows 0..1
  roof: number;        // 0 = off (lifted/hidden), 1 = dropped on
  lights: number;      // interior light intensity 0..1
  dusk: number;        // sky/exposure warm-up 0..1
  roomCount: number;
  // camera scalars (tweened); scene lerps toward these
  cpx: number; cpy: number; cpz: number;
  ctx: number; cty: number; ctz: number;
}

export const CAM_START: [number, number, number] = [0, 70, 0.1];
export const CAM_TGT_START: [number, number, number] = [0, 0, 0];
export const CAM_HERO: [number, number, number] = [30, 22, 38];
export const CAM_TGT_HERO: [number, number, number] = [0, 4, 0];

export const anim: Anim = {
  grid: 0, plot: 0, dims: 0, roomsProgress: 0, walls: 0, openings: 0,
  roof: 0, lights: 0, dusk: 0, roomCount: 0,
  cpx: CAM_START[0], cpy: CAM_START[1], cpz: CAM_START[2],
  ctx: CAM_TGT_START[0], cty: CAM_TGT_START[1], ctz: CAM_TGT_START[2],
};

/** Reset all stage values to the pre-sequence state for `count` rooms. */
export function resetAnim(count: number) {
  anim.grid = 0; anim.plot = 0; anim.dims = 0; anim.roomsProgress = 0;
  anim.walls = 0; anim.openings = 0; anim.roof = 0; anim.lights = 0; anim.dusk = 0;
  anim.roomCount = count;
  anim.cpx = CAM_START[0]; anim.cpy = CAM_START[1]; anim.cpz = CAM_START[2];
  anim.ctx = CAM_TGT_START[0]; anim.cty = CAM_TGT_START[1]; anim.ctz = CAM_TGT_START[2];
}

/** Jump straight to the finished frame (reduced motion / static fallback). */
export function finishAnim(count: number) {
  anim.grid = 1; anim.plot = 1; anim.dims = 1; anim.roomsProgress = count;
  anim.walls = 1; anim.openings = 1; anim.roof = 1; anim.lights = 1; anim.dusk = 1;
  anim.roomCount = count;
  anim.cpx = CAM_HERO[0]; anim.cpy = CAM_HERO[1]; anim.cpz = CAM_HERO[2];
  anim.ctx = CAM_TGT_HERO[0]; anim.cty = CAM_TGT_HERO[1]; anim.ctz = CAM_TGT_HERO[2];
}
