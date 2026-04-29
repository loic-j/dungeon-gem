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

export function playVictorySoundBright(): void {
  resume();
  const c = getCtx();
  const now = c.currentTime;

  function schedNote(
    freq: number,
    type: OscillatorType,
    t: number,
    dur: number,
    vol: number,
  ) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  const kick = c.createOscillator();
  const kickGain = c.createGain();
  kick.connect(kickGain);
  kickGain.connect(c.destination);
  kick.type = "sine";
  kick.frequency.setValueAtTime(120, now);
  kick.frequency.exponentialRampToValueAtTime(40, now + 0.12);
  kickGain.gain.setValueAtTime(0.8, now);
  kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  kick.start(now);
  kick.stop(now + 0.2);

  const bufSize = Math.ceil(c.sampleRate * 0.6);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const bufData = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) bufData[i] = Math.random() * 2 - 1;
  const cymbal = c.createBufferSource();
  cymbal.buffer = buf;
  const cymbalHp = c.createBiquadFilter();
  cymbalHp.type = "highpass";
  cymbalHp.frequency.value = 7000;
  const cymbalGain = c.createGain();
  cymbalGain.gain.setValueAtTime(0.25, now);
  cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  cymbal.connect(cymbalHp);
  cymbalHp.connect(cymbalGain);
  cymbalGain.connect(c.destination);
  cymbal.start(now);

  schedNote(392.0, "sawtooth", now + 0.08, 0.07, 0.35);
  schedNote(440.0, "sawtooth", now + 0.15, 0.07, 0.35);
  schedNote(493.88, "sawtooth", now + 0.22, 0.07, 0.35);
  schedNote(523.25, "sawtooth", now + 0.32, 0.2, 0.5);
  schedNote(659.26, "sawtooth", now + 0.52, 0.2, 0.5);
  schedNote(783.99, "sawtooth", now + 0.72, 0.65, 0.55);
  schedNote(261.63, "square", now + 0.08, 0.07, 0.15);
  schedNote(329.63, "square", now + 0.15, 0.07, 0.15);
  schedNote(392.0, "square", now + 0.22, 0.07, 0.15);
  schedNote(261.63, "square", now + 0.32, 0.2, 0.18);
  schedNote(329.63, "square", now + 0.52, 0.2, 0.18);
  schedNote(392.0, "square", now + 0.72, 0.65, 0.18);
  schedNote(65.41, "sine", now, 0.35, 0.5);
  schedNote(98.0, "sine", now + 0.32, 0.42, 0.35);
  schedNote(65.41, "sine", now + 0.72, 0.75, 0.45);
}

export function playVictorySound(): void {
  resume();
  const c = getCtx();
  const now = c.currentTime;

  function schedNote(
    freq: number,
    type: OscillatorType,
    t: number,
    dur: number,
    vol: number,
    detune = 0,
  ) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  // Deep kick
  const kick = c.createOscillator();
  const kickGain = c.createGain();
  kick.connect(kickGain);
  kickGain.connect(c.destination);
  kick.type = "sine";
  kick.frequency.setValueAtTime(100, now);
  kick.frequency.exponentialRampToValueAtTime(35, now + 0.15);
  kickGain.gain.setValueAtTime(0.8, now);
  kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  kick.start(now);
  kick.stop(now + 0.22);

  // Low stone thud (mid noise, not bright cymbal)
  const bufSize = Math.ceil(c.sampleRate * 0.4);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const bufData = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) bufData[i] = Math.random() * 2 - 1;
  const thud = c.createBufferSource();
  thud.buffer = buf;
  const thudBp = c.createBiquadFilter();
  thudBp.type = "bandpass";
  thudBp.frequency.value = 800;
  thudBp.Q.value = 1.0;
  const thudGain = c.createGain();
  thudGain.gain.setValueAtTime(0.18, now);
  thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  thud.connect(thudBp);
  thudBp.connect(thudGain);
  thudGain.connect(c.destination);
  thud.start(now);

  // Grace notes: E4, G4, A4 (ascending A minor)
  schedNote(329.63, "sawtooth", now + 0.08, 0.07, 0.32);
  schedNote(392.0, "sawtooth", now + 0.15, 0.07, 0.32);
  schedNote(440.0, "sawtooth", now + 0.22, 0.07, 0.32);

  // Fanfare: C5, E5 staccato → A5 held (Am chord, root on top)
  schedNote(523.25, "sawtooth", now + 0.32, 0.2, 0.48);
  schedNote(659.26, "sawtooth", now + 0.52, 0.2, 0.48);
  schedNote(880.0, "sawtooth", now + 0.72, 0.7, 0.52);
  schedNote(880.0, "sawtooth", now + 0.72, 0.7, 0.18, 8); // slight detune chorus

  // Harmony (square, Am chord below)
  schedNote(164.81, "square", now + 0.08, 0.07, 0.12);
  schedNote(196.0, "square", now + 0.15, 0.07, 0.12);
  schedNote(220.0, "square", now + 0.22, 0.07, 0.12);
  schedNote(261.63, "square", now + 0.32, 0.2, 0.15);
  schedNote(329.63, "square", now + 0.52, 0.2, 0.15);
  schedNote(440.0, "square", now + 0.72, 0.7, 0.15);

  // Long resonant A2 gong on final beat (matches bg drone)
  schedNote(110.0, "sine", now + 0.72, 1.6, 0.45);
  schedNote(220.0, "sine", now + 0.72, 1.2, 0.22);

  // Bass pedal: A2 throughout
  schedNote(110.0, "sine", now, 0.38, 0.5);
  schedNote(110.0, "sine", now + 0.32, 0.42, 0.4);
}

let footstepToggle = false;

function playOneFootstep(delaySeconds: number): void {
  const c = getCtx();
  const t = c.currentTime + delaySeconds;
  const pitch = footstepToggle ? 90 : 110;
  footstepToggle = !footstepToggle;

  const bufSize = Math.ceil(c.sampleRate * 0.12);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 180;
  filter.Q.value = 1.5;
  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.35, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  source.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(c.destination);
  source.start(t);

  const osc = c.createOscillator();
  const oscGain = c.createGain();
  osc.connect(oscGain);
  oscGain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, t);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, t + 0.1);
  oscGain.gain.setValueAtTime(0.4, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  osc.start(t);
  osc.stop(t + 0.1);
}

export function playFootstepSound(): void {
  resume();
  const stepInterval = 0.28;
  const steps = 3;
  for (let i = 0; i < steps; i++) {
    playOneFootstep(i * stepInterval);
  }
}

export function playGameOverSound(): void {
  resume();
  playTone(300, "sawtooth", 0.8, 0.5, 80);
  playTone(220, "sawtooth", 1.2, 0.4, 60);
  playNoise(0.6, 0.25, 300);
}

// ── Background & boss music ────────────────────────────────────────────────────
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
  gainNode: GainNode,
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
    gain.connect(gainNode);
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
    scheduleVoice(bgGain!, MELODY, nextMelody, 0.12);
    nextMelody += MELODY_LOOP_DUR;
    melodyScheduler = setTimeout(
      melodyLoop,
      Math.max(0, (nextMelody - c.currentTime - 0.5) * 1000),
    );
  }

  function bassLoop() {
    scheduleVoice(bgGain!, BASS, nextBass, 0.08, "sine");
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

// Boss music — faster, heavier, E minor battle theme
const BOSS_MELODY: Note[] = [
  { f: 329.63, d: 0.15 }, { f: 329.63, d: 0.15 }, { f: 293.66, d: 0.15 },
  { f: 329.63, d: 0.3 },  { f: 370.0, d: 0.15 },  { f: 329.63, d: 0.15 },
  { f: 293.66, d: 0.3 },  { f: 261.63, d: 0.15 },  { f: 246.94, d: 0.15 },
  { f: 220.0, d: 0.5 },
  { f: 246.94, d: 0.15 }, { f: 261.63, d: 0.15 }, { f: 293.66, d: 0.15 },
  { f: 329.63, d: 0.15 }, { f: 370.0, d: 0.15 },  { f: 392.0, d: 0.3 },
  { f: 370.0, d: 0.15 },  { f: 329.63, d: 0.15 }, { f: 293.66, d: 0.5 },
  { f: 440.0, d: 0.2 },   { f: 392.0, d: 0.2 },   { f: 370.0, d: 0.2 },
  { f: 329.63, d: 0.4 },  { f: 293.66, d: 0.2 },  { f: 261.63, d: 0.2 },
  { f: 220.0, d: 0.7 },
];

const BOSS_BASS: Note[] = [
  { f: 82.41, d: 0.3 },  { f: 82.41, d: 0.3 },
  { f: 73.42, d: 0.3 },  { f: 65.41, d: 0.3 },
  { f: 73.42, d: 0.3 },  { f: 82.41, d: 0.3 },
  { f: 73.42, d: 0.6 },  { f: 82.41, d: 0.3 },
  { f: 98.0, d: 0.3 },   { f: 110.0, d: 0.6 },
];

const BOSS_MELODY_DUR = BOSS_MELODY.reduce((s, n) => s + n.d, 0);
const BOSS_BASS_DUR = BOSS_BASS.reduce((s, n) => s + n.d, 0);

let bossMusicGain: GainNode | null = null;
let bossDrones: OscillatorNode[] = [];
let bossMelodyScheduler: ReturnType<typeof setTimeout> | null = null;
let bossBassScheduler: ReturnType<typeof setTimeout> | null = null;

export function startBossMusic(): void {
  stopBackgroundMusic();
  if (bossMusicGain) return;
  resume();
  const c = getCtx();

  bossMusicGain = c.createGain();
  bossMusicGain.gain.value = 1;
  bossMusicGain.connect(c.destination);

  // Dissonant low drones
  const droneFreqs = [55, 55.9, 82.41, 83.3];
  bossDrones = droneFreqs.map((freq, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    g.gain.value = i < 2 ? 0.05 : 0.03;
    osc.connect(g);
    g.connect(bossMusicGain!);
    osc.start();
    return osc;
  });

  let nextMelody = c.currentTime;
  let nextBass = c.currentTime;

  function melodyLoop() {
    scheduleVoice(bossMusicGain!, BOSS_MELODY, nextMelody, 0.15, "sawtooth");
    nextMelody += BOSS_MELODY_DUR;
    bossMelodyScheduler = setTimeout(
      melodyLoop,
      Math.max(0, (nextMelody - c.currentTime - 0.5) * 1000),
    );
  }

  function bassLoop() {
    scheduleVoice(bossMusicGain!, BOSS_BASS, nextBass, 0.14, "square");
    nextBass += BOSS_BASS_DUR;
    bossBassScheduler = setTimeout(
      bassLoop,
      Math.max(0, (nextBass - c.currentTime - 0.5) * 1000),
    );
  }

  melodyLoop();
  bassLoop();
}

export function stopBossMusic(): void {
  if (bossMelodyScheduler !== null) clearTimeout(bossMelodyScheduler);
  if (bossBassScheduler !== null) clearTimeout(bossBassScheduler);
  bossDrones.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* already stopped */
    }
  });
  bossMusicGain?.disconnect();
  bossMusicGain = null;
  bossDrones = [];
  bossMelodyScheduler = null;
  bossBassScheduler = null;
}
