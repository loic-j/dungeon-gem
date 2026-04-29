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

| Property   | Value                                      |
|------------|--------------------------------------------|
| Max HP     | 10                                         |
| Starting HP| 10                                         |
| Threshold  | 3                                          |
| Resistance | 🔥 Fire (×0.8)                             |
| Weakness   | 💧 Water (×1.2)                            |

### Skeleton Spells

| Spell        | Level | Damage | Weight | Notes              |
|--------------|-------|--------|--------|--------------------|
| Basic Attack | 1     | 3      | 0.7    | Frequent, weak     |
| Bone Strike  | 2     | 5      | 0.3    | Less frequent, stronger |

Spell selection uses weighted random + staleness (see game-design.md). Next spell pre-picked after each cast → sword icons show 1 or 2 swords in enemy info area.

---

## POC Combat Flow

```
Combat start
  → Player: 1 random mana, 20/20 HP
  → Monster: 10/10 HP, 0 AP, random initial nextSpell picked

Each turn (turn counter increments at mana phase):
  1. Player gains 1 mana (random) — turn counter +1
  2. Monster gains 1 action point
  3. Player chooses a spell (if mana available) or skip
  4. Monster roll: AP/3 → attack chance (danger bar shows this)
     if attack:
       → cast nextSpell (shown to player via sword icons)
       → player loses spell.damage HP
       → AP reset to -1 (becomes 0 next mana phase)
       → new nextSpell immediately picked (weighted random + staleness)
       → attack notification shown (spell name + damage), auto-disappears
  5. (no status effects in POC)

Combat end:
  → Monster HP ≤ 0: victory → new combat (same monster type)
  → Player HP ≤ 0: Game Over
```

---

## POC Validation Criteria

- [ ] Mana generates and accumulates correctly
- [ ] Spells disable when mana is insufficient
- [ ] Correct damage calculation (fire resistance, water weakness)
- [ ] Monster danger bar grows visually each turn
- [ ] Monster attacks probabilistically (not systematically)
- [ ] Both Skeleton spells fire over time (no spell permanently ignored)
- [ ] Sword icons update correctly after each monster cast (1 = Basic Attack, 2 = Bone Strike)
- [ ] Attack notification appears and auto-dismisses (~2s)
- [ ] Combat chain → new combat works
- [ ] Game Over triggered correctly
- [ ] Interface readable on mobile (vertical format)
