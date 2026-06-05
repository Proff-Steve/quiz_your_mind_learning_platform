let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export type SoundCategory =
  | "background"
  | "moves"
  | "captures"
  | "alerts"
  | "outcomes"
  | "events";

export interface SoundPrefs {
  masterMute: boolean;
  categories: Record<SoundCategory, boolean>;
}

const DEFAULT_PREFS: SoundPrefs = {
  masterMute: false,
  categories: {
    background: true,
    moves: true,
    captures: true,
    alerts: true,
    outcomes: true,
    events: true,
  },
};

const PREFS_KEY = "qym_sound_prefs";

function loadPrefs(): SoundPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SoundPrefs>;
      return {
        masterMute: parsed.masterMute ?? DEFAULT_PREFS.masterMute,
        categories: { ...DEFAULT_PREFS.categories, ...(parsed.categories ?? {}) },
      };
    }
  } catch {}
  return { ...DEFAULT_PREFS, categories: { ...DEFAULT_PREFS.categories } };
}

let prefs: SoundPrefs = loadPrefs();
const listeners: Set<() => void> = new Set();

function saveAndNotify() {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  listeners.forEach(fn => fn());
}

export function isEnabled(category: SoundCategory): boolean {
  return !prefs.masterMute && prefs.categories[category];
}

export const soundSettings = {
  getPrefs(): SoundPrefs {
    return { ...prefs, categories: { ...prefs.categories } };
  },
  setMasterMute(muted: boolean) {
    prefs.masterMute = muted;
    if (muted) bgStop();
    else if (prefs.categories.background) bgStart();
    saveAndNotify();
  },
  toggleCategory(cat: SoundCategory) {
    prefs.categories[cat] = !prefs.categories[cat];
    if (cat === "background") {
      if (prefs.categories.background && !prefs.masterMute) bgStart();
      else bgStop();
    }
    saveAndNotify();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  startTime = 0,
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + startTime);
  gain.gain.setValueAtTime(0, ac.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + duration);
  osc.start(ac.currentTime + startTime);
  osc.stop(ac.currentTime + startTime + duration + 0.05);
}

let bgGainNode: GainNode | null = null;
let bgOscillators: OscillatorNode[] = [];
let bgRunning = false;

function bgStart() {
  if (bgRunning) return;
  bgRunning = true;

  const ac = getCtx();

  bgGainNode = ac.createGain();
  bgGainNode.gain.setValueAtTime(0, ac.currentTime);
  bgGainNode.gain.linearRampToValueAtTime(0.055, ac.currentTime + 3);
  bgGainNode.connect(ac.destination);

  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(0.12, ac.currentTime);
  lfoGain.gain.setValueAtTime(0.018, ac.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(bgGainNode.gain);
  lfo.start();
  bgOscillators.push(lfo);

  const droneFreqs: [number, OscillatorType, number][] = [
    [110.0, "sine", 1.0],
    [110.4, "sine", 0.6],
    [164.8, "sine", 0.7],
    [220.0, "sine", 0.5],
    [246.9, "sine", 0.35],
    [329.6, "sine", 0.25],
  ];

  droneFreqs.forEach(([freq, type, relVol]) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    g.gain.setValueAtTime(relVol, ac.currentTime);
    osc.connect(g);
    g.connect(bgGainNode!);
    osc.start();
    bgOscillators.push(osc);
  });
}

function bgStop() {
  if (!bgRunning || !bgGainNode) return;
  bgRunning = false;
  const ac = getCtx();
  const now = ac.currentTime;
  bgGainNode.gain.setValueAtTime(bgGainNode.gain.value, now);
  bgGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
  bgOscillators.forEach(osc => {
    try { osc.stop(now + 2); } catch {}
  });
  bgOscillators = [];
  bgGainNode = null;
}

export const sounds = {
  place() {
    if (!isEnabled("moves")) return;
    tone(440, 0.12, "sine", 0.25);
  },
  move() {
    if (!isEnabled("moves")) return;
    tone(520, 0.1, "sine", 0.2);
    tone(660, 0.08, "sine", 0.15, 0.07);
  },
  capture() {
    if (!isEnabled("captures")) return;
    tone(300, 0.06, "square", 0.2);
    tone(200, 0.12, "sawtooth", 0.15, 0.06);
  },
  invalid() {
    if (!isEnabled("alerts")) return;
    tone(160, 0.08, "square", 0.2);
    tone(140, 0.12, "square", 0.15, 0.08);
  },
  win() {
    if (!isEnabled("outcomes")) return;
    const melody = [523, 659, 784, 1047];
    melody.forEach((f, i) => tone(f, 0.25, "sine", 0.3, i * 0.18));
  },
  lose() {
    if (!isEnabled("outcomes")) return;
    const melody = [392, 349, 294, 220];
    melody.forEach((f, i) => tone(f, 0.28, "sine", 0.25, i * 0.2));
  },
  draw() {
    if (!isEnabled("outcomes")) return;
    tone(440, 0.15, "sine", 0.2);
    tone(440, 0.15, "sine", 0.2, 0.25);
  },
  check() {
    if (!isEnabled("alerts")) return;
    tone(880, 0.08, "square", 0.25);
    tone(660, 0.1, "square", 0.2, 0.1);
  },
  gameStart() {
    if (!isEnabled("events")) return;
    tone(523, 0.12, "sine", 0.25);
    tone(659, 0.12, "sine", 0.25, 0.13);
    tone(784, 0.2, "sine", 0.3, 0.26);
  },
  opponentJoined() {
    if (!isEnabled("events")) return;
    tone(660, 0.1, "sine", 0.2);
    tone(880, 0.15, "sine", 0.25, 0.12);
  },
  startBackground() {
    if (!isEnabled("background")) return;
    bgStart();
  },
  stopBackground() {
    bgStop();
  },
};
