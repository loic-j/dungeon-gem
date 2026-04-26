import type { Element } from '../game/types'

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function resume() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
}

export function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  gainPeak: number,
  freqEnd?: number,
) {
  const c = getCtx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)

  osc.type = type
  osc.frequency.setValueAtTime(frequency, c.currentTime)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, c.currentTime + duration)
  }

  gain.gain.setValueAtTime(gainPeak, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

export function playNoise(duration: number, gainPeak: number, filterFreq: number) {
  const c = getCtx()
  const bufSize = c.sampleRate * duration
  const buf = c.createBuffer(1, bufSize, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

  const source = c.createBufferSource()
  source.buffer = buf

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 1.5

  const gain = c.createGain()
  gain.gain.setValueAtTime(gainPeak, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)
  source.start()
}

const SPELL_SOUNDS: Record<Element, () => void> = {
  fire: () => {
    playTone(180, 'sawtooth', 0.4, 0.6, 80)
    playNoise(0.3, 0.3, 1200)
  },
  water: () => {
    playTone(520, 'sine', 0.5, 0.4, 320)
    playTone(780, 'sine', 0.3, 0.2, 480)
  },
  lightning: () => {
    playNoise(0.15, 0.8, 3000)
    playTone(1200, 'square', 0.12, 0.5, 200)
  },
  nature: () => {
    playTone(140, 'triangle', 0.5, 0.5, 100)
    playTone(210, 'triangle', 0.4, 0.25, 140)
  },
}

export function playSpellSound(element: Element): void {
  resume()
  SPELL_SOUNDS[element]?.()
}


export function playVictorySound(): void {
  resume()
  const c = getCtx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    const t = c.currentTime + i * 0.12
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.linearRampToValueAtTime(0.45, t + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc.start(t)
    osc.stop(t + 0.25)
  })
}

export function playGameOverSound(): void {
  resume()
  playTone(300, 'sawtooth', 0.8, 0.5, 80)
  playTone(220, 'sawtooth', 1.2, 0.4, 60)
  playNoise(0.6, 0.25, 300)
}
