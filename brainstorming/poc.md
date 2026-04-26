# POC — Proof of Concept

Goal: validate the core game mechanics with minimum content.
No reward system, no progression. Combat only.

---

## Scope

### What is implemented
- Complete turn-based combat
- Mana system (pool, random draw, accumulation, replacement when full)
- 4 simple player spells
- 1 monster type
- Damage calculation with resistances/weaknesses
- Monster action point mechanic + visual tension bar
- Complete turn structure (mana gain → player action → monster action → status)
- Game Over screen if player dies
- Combat chain (same monster repeated)

### What is excluded
- Reward system
- Level up / player progression
- Status effects (burn, poison, stun...)
- Special spells / secondary effects
- Multiple monster types
- Definitive sprites / assets (placeholders accepted)

---

## Player Spells (4 fixed spells)

| Spell | Element | Mana Cost | Damage |
|-------|---------|-----------|--------|
| Flame | 🔥 Fire | 1🔥 | 5 |
| Wave | 💧 Water | 1💧 | 5 |
| Bolt | ⚡ Lightning | 1⚡ | 5 |
| Roots | 🌿 Nature | 1🌿 | 5 |

---

## Monster (unique type)

| Property | Value |
|----------|-------|
| Max HP | 10 |
| Starting HP | 10 |
| Spell | Basic Attack — 3 damage |
| Threshold | 3 |
| Resistance | 🔥 Fire (×0.8) |
| Weakness | 💧 Water (×1.2) |

---

## POC Combat Flow

```
Combat start
  → Player: 1 random mana, 20/20 HP
  → Monster: 10/10 HP, 0 action points

Each turn:
  1. Player gains 1 mana (random)
  2. Monster gains 1 action point
  3. Player chooses a spell (if mana available) or skip
  4. Monster roll: points/3 → attack chance (visual bar)
     if attack → player loses 3 HP, points reset to 0
  5. (no status effects in POC)

Combat end:
  → Monster HP ≤ 0: victory → new combat (same monster)
  → Player HP ≤ 0: Game Over
```

---

## POC Validation Criteria

- [ ] Mana generates and accumulates correctly
- [ ] Spells disable when mana is insufficient
- [ ] Correct damage calculation (fire resistance, water weakness)
- [ ] Monster tension bar grows visually each turn
- [ ] Monster attacks probabilistically (not systematically)
- [ ] Combat chain → new combat works
- [ ] Game Over triggered correctly
- [ ] Interface readable on mobile (vertical format)
