import type { Spell } from "../types";

export const SPELL_LIBRARY: Spell[] = [
  {
    id: "flame",
    name: "Flame",
    element: "fire",
    damage: 5,
    manaCost: ["fire"],
    weight: 1,
  },
  {
    id: "wave",
    name: "Wave",
    element: "water",
    damage: 5,
    manaCost: ["water"],
    weight: 1,
  },
  {
    id: "bolt",
    name: "Bolt",
    element: "lightning",
    damage: 5,
    manaCost: ["lightning"],
    weight: 1,
  },
  {
    id: "roots",
    name: "Roots",
    element: "nature",
    damage: 5,
    manaCost: ["nature"],
    weight: 1,
  },
];
