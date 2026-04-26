# 10 — Final Validation

**Status: ✅ DONE**

## Goal

Verify all POC validation criteria defined in `brainstorming/poc.md`.
Full Playwright tests + manual mobile verification.

## Criteria to Validate

| Criterion | Test Type |
|-----------|-----------|
| Mana generates and accumulates correctly | Playwright |
| Spells disable when mana is insufficient | Playwright |
| Correct damage calculation (fire resistance, water weakness) | Playwright |
| Monster tension bar grows each turn | Playwright |
| Monster attacks probabilistically | Playwright (mock random) |
| Combat chain → new combat | Playwright |
| Game Over triggered correctly | Playwright |
| Interface readable on mobile (vertical format) | Playwright (`viewport`) |

## Playwright Tests

`tests/validation.spec.ts`

### Mana Accumulation
- Skip 3 turns → pool contains 3 mana (or less if forced replacement)

### Damage Calculation
- Cast Fire spell → monster HP = 10 - ceil(5×0.8) = 10 - 4 = 6
- Cast Water spell → monster HP = 10 - ceil(5×1.2) = 10 - 6 = 4

### Tension Bar
- Skip 1 turn → bar higher than at start
- Skip 2 turns → bar even higher

### Game Over
- Simulate player at 3 HP (via mock state), monster attacks → Game Over displayed

### Combat Chain
- Kill monster → verify monster HP reset to 10/10

### Mobile
```typescript
test.use({ viewport: { width: 480, height: 854 } })
// Verify: all buttons visible, no scroll needed
```

## Manual Verification (checklist)

- [ ] Open on mobile (or DevTools mobile 480×854)
- [ ] Play 5 complete combats without bugs
- [ ] Verify that the tension bar creates a suspense effect
- [ ] Verify that Game Over displays and "Play Again" works
- [ ] No console errors during the entire session
