import type { Element } from "../game/types";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function resume() {
  const c = getCtx();
  if (c.state === "suspended") c.resume();
}

export function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainPeak: number,
  freqEnd?: number,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      freqEnd,
      c.currentTime + duration,
    );
  }

  gain.gain.setValueAtTime(gainPeak, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export function playNoise(
  duration: number,
  gainPeak: number,
  filterFreq: number,
) {
  const c = getCtx();
  const bufSize = c.sampleRate * duration;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buf;

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 1.5;

  const gain = c.createGain();
  gain.gain.setValueAtTime(gainPeak, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start();
}

const SPELL_SOUNDS: Record<Element, () => void> = {
  fire: () => {
    playTone(180, "sawtooth", 0.4, 0.6, 80);
    playNoise(0.3, 0.3, 1200);
  },
  water: () => {
    playTone(520, "sine", 0.5, 0.4, 320);
    playTone(780, "sine", 0.3, 0.2, 480);
  },
  lightning: () => {
    playNoise(0.15, 0.8, 3000);
    playTone(1200, "square", 0.12, 0.5, 200);
  },
  nature: () => {
    playTone(140, "triangle", 0.5, 0.5, 100);
    playTone(210, "triangle", 0.4, 0.25, 140);
  },
};

export function playSpellSound(element: Element): void {
  resume();
  SPELL_SOUNDS[element]?.();
}

export function playVictorySound(): void {
  resume();
  const c = getCtx();
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "triangle";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

export function playGameOverSound(): void {
  resume();
  playTone(300, "sawtooth", 0.8, 0.5, 80);
  playTone(220, "sawtooth", 1.2, 0.4, 60);
  playNoise(0.6, 0.25, 300);
}

// Background music
interface Note {
  f: number;
  d: number;
}

const MELODY: Note[] = [
  // Phrase A — ascending figure
  { f: 220, d: 0.4 },
  { f: 261.63, d: 0.4 },
  { f: 329.63, d: 0.4 },
  { f: 293.66, d: 0.8 },
  { f: 261.63, d: 0.4 },
  { f: 246.94, d: 0.4 },
  { f: 220, d: 0.8 },
  // Phrase B — descending
  { f: 329.63, d: 0.4 },
  { f: 293.66, d: 0.4 },
  { f: 261.63, d: 0.4 },
  { f: 246.94, d: 0.8 },
  { f: 220, d: 0.4 },
  { f: 196, d: 0.4 },
  { f: 220, d: 0.8 },
  // Phrase C — tension climb
  { f: 392, d: 0.4 },
  { f: 369.99, d: 0.4 },
  { f: 329.63, d: 0.4 },
  { f: 293.66, d: 0.4 },
  { f: 261.63, d: 0.4 },
  { f: 246.94, d: 0.4 },
  { f: 220, d: 0.4 },
  { f: 196, d: 0.4 },
  { f: 220, d: 1.2 },
  // Phrase D — low figure
  { f: 164.81, d: 0.4 },
  { f: 174.61, d: 0.4 },
  { f: 196, d: 0.4 },
  { f: 220, d: 0.8 },
  { f: 246.94, d: 0.4 },
  { f: 261.63, d: 0.4 },
  { f: 220, d: 0.8 },
  { f: 196, d: 0.4 },
  { f: 174.61, d: 0.4 },
  { f: 164.81, d: 1.2 },
];

const BASS: Note[] = [
  { f: 110, d: 1.6 },
  { f: 164.81, d: 1.6 },
  { f: 130.81, d: 1.6 },
  { f: 146.83, d: 1.6 },
  { f: 110, d: 3.2 },
  { f: 130.81, d: 1.6 },
  { f: 164.81, d: 1.6 },
];

const MELODY_LOOP_DUR = MELODY.reduce((s, n) => s + n.d, 0);
const BASS_LOOP_DUR = BASS.reduce((s, n) => s + n.d, 0);

let bgDrones: OscillatorNode[] = [];
let bgGain: GainNode | null = null;
let melodyScheduler: ReturnType<typeof setTimeout> | null = null;
let bassScheduler: ReturnType<typeof setTimeout> | null = null;

function scheduleVoice(
  notes: Note[],
  startTime: number,
  gainValue: number,
  type: OscillatorType = "triangle",
): void {
  const c = getCtx();
  let t = startTime;
  for (const note of notes) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(bgGain!);
    osc.type = type;
    osc.frequency.value = note.f;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(gainValue, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 0.85);
    osc.start(t);
    osc.stop(t + note.d);
    t += note.d;
  }
}

export function startBackgroundMusic(): void {
  if (bgGain) return;
  resume();
  const c = getCtx();

  bgGain = c.createGain();
  bgGain.gain.value = 1;
  bgGain.connect(c.destination);

  const droneFreqs = [55, 55.4, 110, 110.6];
  bgDrones = droneFreqs.map((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.value = i < 2 ? 0.07 : 0.04;
    osc.connect(g);
    g.connect(bgGain!);
    osc.start();
    return osc;
  });

  let nextMelody = c.currentTime;
  let nextBass = c.currentTime;

  function melodyLoop() {
    scheduleVoice(MELODY, nextMelody, 0.12);
    nextMelody += MELODY_LOOP_DUR;
    melodyScheduler = setTimeout(
      melodyLoop,
      Math.max(0, (nextMelody - c.currentTime - 0.5) * 1000),
    );
  }

  function bassLoop() {
    scheduleVoice(BASS, nextBass, 0.08, "sine");
    nextBass += BASS_LOOP_DUR;
    bassScheduler = setTimeout(
      bassLoop,
      Math.max(0, (nextBass - c.currentTime - 0.5) * 1000),
    );
  }

  melodyLoop();
  bassLoop();
}

export function stopBackgroundMusic(): void {
  if (melodyScheduler !== null) clearTimeout(melodyScheduler);
  if (bassScheduler !== null) clearTimeout(bassScheduler);
  bgDrones.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  });
  bgGain?.disconnect();
  bgGain = null;
  bgDrones = [];
  melodyScheduler = null;
  bassScheduler = null;
}
