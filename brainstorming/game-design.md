# Game Design — Elemental Dungeon Crawler

## General Concept

Turn-based dungeon crawler, fixed combat view (no corridor navigation).
Loop: Combat → Reward → Combat → ...
Infinite progression (endless roguelike).

---

## Combat Interface

> Wireframe: [combat-first-screen-design.png](combat-first-screen-design.png)

```
┌─────────────────────────────┐
│  HP / Level                 │
│               [Enemy]       │
│                             │
│  [My Character]  HP / Level │
│                  ○○○○○○←mana│
│                  [Spell 1]  │
│                  [Spell 2]  │
│                  [Spell 3]  │
│  [Skip turn]    [Spell 4]  │
└─────────────────────────────┘
```

**Player (bottom)**

- **HP**: bar + format `current/max` (e.g. `8/20`)
- **Level**: current level
- **Mana**: typed individual circles (color by element) — UI adapts dynamically to current pool size
- **Spells**: 4 clickable slots (disabled if insufficient mana)
- **Skip turn**: passes the turn without action

**Enemy (top)**

- **HP**: displayed (player sees enemy HP)
- **Level**: displayed

---

## Mana System

### Mana Types

| Type | Element   |
| ---- | --------- |
| 🔥   | Fire      |
| 💧   | Water     |
| 🌿   | Nature    |
| ⚡   | Lightning |

### Rules

- **Combat start**: player starts with **1 mana** drawn randomly
- **Each turn**: gain **1 mana** drawn randomly
- Unused mana **accumulates** (up to the maximum)
- **If maximum reached**: remove 1 random existing mana, then add the new draw → total never exceeds the max
- Pool **reset to zero** between each combat
- **Maximum upgradeable** via levels and bonuses

### Values

| When                 | Value                |
| -------------------- | -------------------- |
| Starting maximum     | 3                    |
| Mana at combat start | 1 (random)           |
| Mana gained/turn     | 1 (random)           |
| Evolving maximum     | yes, via progression |

### Strategic Implications

- Spending early = pool control, no forced replacement
- Accumulating = risk of losing a specific type next turn
- Costly spells require planning several turns ahead
- Increasing the maximum = fewer forced replacements, more flexibility

---

## Spell System

### General Rules

- **Start**: 1 predefined spell
- **Max active**: 4 spells simultaneously
- **Level up**: random spells offered at certain levels → player chooses
- **If 4 spells reached**: option to remove an existing spell to learn a new one

### Spell Mana Requirements

- Typed: requires X mana of a specific element (e.g. 2🔥) or multiple elements (e.g. 1🔥, 2🌿)
- Neutral: accepts any type of mana

### Spell Properties

| Property        | Description                                 |
| --------------- | ------------------------------------------- |
| Element         | fire / water / nature / lightning / neutral |
| Damage          | fixed value (used in final calculation)     |
| Special effects | optional (see examples)                     |

### Special Effect Examples

- Heal X HP to the player
- The next spell deals +X extra damage
- _(others to be defined)_

### Spell Primary Element

- Used in damage calculation vs. enemy resistances/weaknesses

---

## HP System

### Starting Values

- **Starting HP**: 20 current / 20 max

### Sources of Loss

- Damage taken in combat

### Sources of Gain (current HP)

- **+3 HP** after each won combat
- Healing spells (if applicable)

### Sources of Gain (max HP)

- Level up rewards

---

## Monster System

### Definition

- Monster types **predefined** (fixed list)
- Each combat: monster drawn **randomly** based on player level and monster type level

### Monster Type Properties

| Property          | Description                                  |
| ----------------- | -------------------------------------------- |
| Level             | Monster power level (used in XP calculation) |
| Max HP            | Fixed per type                               |
| Starting HP       | Fixed per type                               |
| Experience Reward | Base XP granted on kill                      |
| Spells            | Set of 1 to 4 predefined spells              |
| Threshold         | Action point threshold to cast a spell       |
| Resistances       | 0 to N elements (reduced damage)             |
| Weaknesses        | 0 to N elements (increased damage)           |

### Monster Action Mechanic (per turn)

1. Monster gains **+1 action point**
2. Calculate chance to cast a spell: `action_points / threshold`
   - Example: threshold=4, points=3 → **75% chance** to cast a spell
3. If spell cast → **action points reset to 0**, effects applied
4. If damage spell → player loses HP

### Implications

- Monster inactive at combat start (few action points)
- Growing tension each turn without an attack
- Threshold **fixed per type** → defines the monster's "rhythm": high = slow but unpredictable, low = aggressive

---

## Player Progression

| Element     | Detail                                  |
| ----------- | --------------------------------------- |
| Levels      | Infinite                                |
| Starting HP | 20/20                                   |
| Starting XP | 0                                       |
| Max HP      | Upgradeable via level up                |
| Level up    | Random spells offered at certain levels |
| Mana pool   | Upgradeable via rewards                 |
| Stats       | To be defined                           |

---

## Experience System

### XP Gain on Kill

```
xp = monster.experienceReward
```

Flat reward — no level scaling.

### XP Required per Level

```
xpToNextLevel(level) = floor(20 × 1.2^(level-1))
```

| Level | XP to next |
| ----- | ---------- |
| 1 → 2 | 20         |
| 2 → 3 | 24         |
| 3 → 4 | 28         |
| 4 → 5 | 34         |
| 5 → 6 | 41         |

Excess XP carries over when leveling up. Multiple level-ups per kill are possible.

---

## Game Loop

```
START
  └─> Combat
        └─> [Victory] Reward Phase
              └─> Next Combat
        └─> [Defeat] Game Over
```

---

## Reward Phase & Level Up

> **TODO**: system to be developed
>
> **Mechanic**: the player chooses from **3 rewards** offered at the end of each combat.
>
> ### Reward Ideas
>
> **Mana**
>
> - Increase the probability of drawing a specific mana type
> - Increase the mana maximum
> - Start combats with +1 mana of a certain type
>
> **HP**
>
> - Increase max HP
> - Heal HP
>
> **Spells**
>
> - Learn a new spell (from X offered)
>
> **Passives**
>
> - Passive bonus (to be defined)
> - ...
>
> _Content and balancing remain to be defined._

---

## Combat Mechanic

### Damage Calculation

```
final damage = spell_damage × element_modifier  (rounded up)

modifier:
  weakness    → ×1.2
  neutral     → ×1
  resistance  → ×0.8
```

### Turn Structure

```
1. Player mana gain          (+1 random)
2. Monster action point gain (+1)
3. Player phase              → choose spell or skip
4. Monster phase             → roll (points/threshold)
                                if success: cast spell + reset points to 0
5. End of turn               → apply active status effects (burn, poison...)
```

### Monster Telegraphing

- Visual "rage" bar showing attack pressure
- **Exact value not displayed** → tension maintained for the player

### Spell Effect Ideas (not element-related)

- Burn: X damage/turn for N turns
- Poison: X damage/turn for N turns
- Stun: reset monster action points to 0
- Slow: monster gains fewer action points
- Heal: restore X HP to the player
- Amplify: next spell deals +X damage

---

## To Be Defined

- Enemy types and their elements
- Player stats (ATK, DEF, SPD?)
- Number of spells offered at level up
