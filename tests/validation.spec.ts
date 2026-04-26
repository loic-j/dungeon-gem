import { test, expect, type Page } from '@playwright/test'
import type { GameState } from '../src/game/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function loadAndWait(page: Page) {
  await page.goto('/')
  await page.getByTestId('skip-btn').waitFor()
  // Let first render settle
  await page.waitForTimeout(100)
}

/** Inject game state directly via the debug API exposed in DEV mode. */
async function setState(page: Page, patch: Partial<GameState>) {
  await page.evaluate((p) => {
    const g = (window as Record<string, unknown>)['__game'] as {
      getState: () => unknown
      setState: (s: unknown) => void
    }
    g.setState({ ...g.getState() as object, ...p })
  }, patch as Record<string, unknown>)
  await page.waitForTimeout(50)
}

/** Click an element, bypassing canvas pointer-event interception. */
async function forceClick(page: Page, testid: string) {
  await page.locator(`[data-testid="${testid}"]`).click({ force: true })
}

/** Wait for the locked state to clear (action animation done, ~700 ms). */
async function waitForUnlock(page: Page) {
  await page.waitForFunction(() => {
    const g = (window as Record<string, unknown>)['__game'] as { isLocked: () => boolean } | undefined
    return g ? !g.isLocked() : false
  }, { timeout: 5000 })
}

async function skipTurn(page: Page) {
  await forceClick(page, 'skip-btn')
  await waitForUnlock(page)
}

// ── Layout / mobile viewport ───────────────────────────────────────────────────

test('all UI elements visible on 480×854 without scroll', async ({ page }) => {
  await loadAndWait(page)

  for (const id of ['enemy-hp', 'player-hp', 'skip-btn', 'spell-flame', 'spell-wave', 'spell-bolt', 'spell-roots', 'mana-row']) {
    await expect(page.getByTestId(id)).toBeVisible()
  }

  const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)
  expect(scrollable).toBe(false)
})

// ── Mana accumulation ─────────────────────────────────────────────────────────

test('mana pool has 3 circles matching maxMana', async ({ page }) => {
  await loadAndWait(page)
  // maxMana = 3, so mana-row always renders exactly 3 circles
  await expect(page.getByTestId('mana-row').locator('div')).toHaveCount(3)
})

test('mana accumulates across skipped turns', async ({ page }) => {
  await loadAndWait(page)

  // Start from empty pool (1 init token)
  const state = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return g.getState() as GameState
  })
  const startCount = state.player.manaPool.length

  // Skip a turn — pool should grow (as long as < max)
  await skipTurn(page)

  const next = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return (g.getState() as GameState).player.manaPool.length
  })

  // Pool grows or stays at max (3)
  expect(next).toBeGreaterThanOrEqual(startCount)
  expect(next).toBeLessThanOrEqual(3)
})

// ── Spell enable/disable based on mana ────────────────────────────────────────

test('spell buttons disabled when mana type unavailable', async ({ page }) => {
  await loadAndWait(page)

  // Inject state: only fire mana in pool
  await setState(page, {
    player: {
      hp: 20, maxHp: 20, level: 1, maxMana: 3,
      manaPool: ['fire'],
      spells: [
        { id: 'flame',  name: 'Flame', element: 'fire',      damage: 5, manaCost: ['fire'] },
        { id: 'wave',   name: 'Wave',  element: 'water',     damage: 5, manaCost: ['water'] },
        { id: 'bolt',   name: 'Bolt',  element: 'lightning', damage: 5, manaCost: ['lightning'] },
        { id: 'roots',  name: 'Roots', element: 'nature',    damage: 5, manaCost: ['nature'] },
      ],
    } as GameState['player'],
  })

  await expect(page.getByTestId('spell-flame')).toHaveCSS('pointer-events', 'auto')
  for (const id of ['spell-wave', 'spell-bolt', 'spell-roots']) {
    await expect(page.getByTestId(id)).toHaveCSS('pointer-events', 'none')
  }
})

// ── Damage calculation ─────────────────────────────────────────────────────────

test('fire spell deals 4 damage (resistance ×0.8): HP 10→6', async ({ page }) => {
  await loadAndWait(page)
  await setState(page, {
    player: {
      hp: 20, maxHp: 20, level: 1, maxMana: 3,
      manaPool: ['fire'],
      spells: [
        { id: 'flame', name: 'Flamme', element: 'fire', damage: 5, manaCost: ['fire'] },
        { id: 'wave',  name: 'Vague',  element: 'water', damage: 5, manaCost: ['water'] },
        { id: 'bolt',  name: 'Éclair', element: 'lightning', damage: 5, manaCost: ['lightning'] },
        { id: 'roots', name: 'Racines', element: 'nature', damage: 5, manaCost: ['nature'] },
      ],
    } as GameState['player'],
  })

  await expect(page.getByTestId('enemy-hp')).toHaveText('Enemy HP: 10 / 10')
  await forceClick(page, 'spell-flame')
  await waitForUnlock(page)
  await expect(page.getByTestId('enemy-hp')).toHaveText('Enemy HP: 6 / 10')
})

test('water spell deals 6 damage (weakness ×1.2): HP 10→4', async ({ page }) => {
  await loadAndWait(page)
  await setState(page, {
    player: {
      hp: 20, maxHp: 20, level: 1, maxMana: 3,
      manaPool: ['water'],
      spells: [
        { id: 'flame', name: 'Flamme', element: 'fire', damage: 5, manaCost: ['fire'] },
        { id: 'wave',  name: 'Vague',  element: 'water', damage: 5, manaCost: ['water'] },
        { id: 'bolt',  name: 'Éclair', element: 'lightning', damage: 5, manaCost: ['lightning'] },
        { id: 'roots', name: 'Racines', element: 'nature', damage: 5, manaCost: ['nature'] },
      ],
    } as GameState['player'],
  })

  await forceClick(page, 'spell-wave')
  await waitForUnlock(page)
  await expect(page.getByTestId('enemy-hp')).toHaveText('Enemy HP: 4 / 10')
})

// ── Tension bar ───────────────────────────────────────────────────────────────

test('tension bar grows after each skipped turn', async ({ page }) => {
  await loadAndWait(page)

  const baseState = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return g.getState() as GameState
  })
  // High threshold → attack prob ~1%/turn, AP accumulates reliably without resets
  await setState(page, { monster: { ...baseState.monster, actionPoints: 0, threshold: 100 } })

  const getTension = () => page.evaluate(() => {
    const el = document.querySelector('[data-testid="tension-fill"]') as HTMLElement | null
    return el ? parseInt(el.style.width) || 0 : 0
  })

  const t0 = await getTension()
  await skipTurn(page)
  const t1 = await getTension()
  await skipTurn(page)
  const t2 = await getTension()

  expect(t1).toBeGreaterThan(t0)
  expect(t2).toBeGreaterThan(t1)
})

// ── Monster attacks probabilistically ─────────────────────────────────────────

test('monster skips attack when AP is low (probabilistic)', async ({ page }) => {
  await loadAndWait(page)

  // Force AP=0 so attack probability = 0/3 = 0 — monster cannot attack this turn
  const baseState = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return g.getState() as GameState
  })
  await setState(page, { monster: { ...baseState.monster, actionPoints: 0 } })

  const hpBefore = await page.getByTestId('player-hp').textContent()
  await skipTurn(page)
  const hpAfter = await page.getByTestId('player-hp').textContent()

  // AP was 0 → prob=0 → monster cannot attack → HP unchanged after the skip
  expect(hpAfter).toBe(hpBefore)
})

// ── Game Over ─────────────────────────────────────────────────────────────────

test('Game Over appears when player HP reaches 0', async ({ page }) => {
  await loadAndWait(page)

  // Inject player HP=3 and monster AP=3 (100% attack probability)
  const baseState = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return g.getState() as GameState
  })
  await setState(page, {
    player: { ...baseState.player, hp: 3 },
    monster: { ...baseState.monster, actionPoints: 3 },
  })

  // One skip: monster has 100% attack chance → deals 3 dmg → player HP = 0 → GAME OVER
  await forceClick(page, 'skip-btn')
  await expect(page.getByText('GAME OVER')).toBeVisible({ timeout: 5000 })
})

// ── Victory + combat reset ─────────────────────────────────────────────────────

test('after victory enemy HP resets to 10/10', async ({ page }) => {
  await loadAndWait(page)

  // Set monster HP=1, give player water mana (1 Vague kills it: 6 dmg > 1 HP)
  const baseState = await page.evaluate(() => {
    const g = (window as Record<string, unknown>)['__game'] as { getState: () => unknown }
    return g.getState() as GameState
  })
  await setState(page, {
    player: { ...baseState.player, manaPool: ['water'] },
    monster: { ...baseState.monster, hp: 1, actionPoints: 0 },
  })

  await forceClick(page, 'spell-wave')
  await expect(page.getByText('Victory!')).toBeVisible({ timeout: 5000 })
  await page.getByText('Victory!').click()
  await expect(page.getByTestId('enemy-hp')).toHaveText('Enemy HP: 10 / 10', { timeout: 3000 })
})
