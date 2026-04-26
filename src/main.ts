import { initScene } from './renderer/scene'
import { createOverlay } from './ui/overlay'
import {
  initCombat,
  processManaPhase,
  processPlayerAction,
  processMonsterPhase,
  checkCombatEnd,
  resetCombat,
} from './game/turnMachine'
import type { GameState } from './game/types'

const canvas    = document.getElementById('canvas') as HTMLCanvasElement
const uiRoot    = document.getElementById('ui') as HTMLDivElement

const { objects } = initScene(canvas)

let state: GameState = initCombat()
let locked = false

const render = createOverlay(uiRoot, {
  onSpell: (spellId) => { if (!locked) act(spellId) },
  onSkip:  ()        => { if (!locked) act(null) },
})

function tick() {
  render(state, locked)
  objects.monsterSprite.visible = state.monster.hp > 0
}

async function act(spellId: string | null) {
  locked = true

  state = processPlayerAction(state, spellId)
  tick()

  await delay(400)

  const { state: afterMonster, attacked } = processMonsterPhase(state)
  state = afterMonster
  if (attacked) {
    flashScreen()
  }
  tick()

  await delay(300)

  const outcome = checkCombatEnd(state)
  if (outcome === 'GAME_OVER') {
    showMessage('GAME OVER', '#c00')
    return
  }
  if (outcome === 'VICTORY') {
    showMessage('Victory!', '#2b8', async () => {
      state = resetCombat(state)
      state = processManaPhase(state)
      locked = false
      tick()
    })
    return
  }

  state = processManaPhase(state)
  locked = false
  tick()
}

function flashScreen() {
  const flash = document.createElement('div')
  flash.style.cssText = `
    position:absolute; inset:0; background:rgba(200,0,0,0.35);
    pointer-events:none; z-index:10;
    animation:flash 0.4s ease-out forwards;
  `
  const style = document.createElement('style')
  style.textContent = '@keyframes flash { from{opacity:1} to{opacity:0} }'
  document.head.appendChild(style)
  document.getElementById('app')!.appendChild(flash)
  setTimeout(() => flash.remove(), 400)
}

function showMessage(text: string, color: string, onDone?: () => void) {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.7); z-index:20; pointer-events:auto; cursor:pointer;
    font-family:sans-serif; font-size:40px; font-weight:bold; color:${color};
    text-shadow:0 2px 12px #000;
  `
  overlay.textContent = text
  document.getElementById('app')!.appendChild(overlay)
  overlay.addEventListener('click', () => {
    overlay.remove()
    onDone?.()
  })
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

// Start first turn
state = processManaPhase(state)
tick()
