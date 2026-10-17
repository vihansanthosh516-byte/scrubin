// Celebration effects for the game layer: confetti and short synthesized chimes.
// Sounds are off by default (Settings → "Celebration sounds"); everything respects reduced motion.
import confetti from "canvas-confetti";

const SOUND_KEY = "scrubin_celebration_sounds";

export const soundsEnabled = () => {
  try {
    return localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
};

export const setSoundsEnabled = (on: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* storage blocked */
  }
};

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Brand + game colours (teal, XP gold, streak orange, success green).
const COLORS = ["#0E7490", "#22D3EE", "#F5B400", "#F97316", "#4ADE80"];

export function burst(kind: "small" | "big" = "small") {
  if (reducedMotion()) return;
  if (kind === "small") {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: COLORS, scalar: 0.9, disableForReducedMotion: true });
    return;
  }
  const end = Date.now() + 900;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors: COLORS, disableForReducedMotion: true });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors: COLORS, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

let ctx: AudioContext | null = null;

/** A short rising chime: "xp" (two notes), "level" (an arpeggio), "streak" (a bright double). */
export function chime(kind: "xp" | "level" | "streak" = "xp") {
  if (!soundsEnabled()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const notes = kind === "level" ? [523, 659, 784, 1047] : kind === "streak" ? [784, 1175] : [659, 988];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      const t = ctx!.currentTime + i * 0.09;
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.3);
    });
  } catch {
    /* no audio */
  }
}
