import type { Spell } from "../types";

export const SPELL_LIBRARY: Spell[] = [
  {
    id: "flame",
    name: "Flame",
    element: "fire",
    damage: 5,
    manaCost: ["fire"],
  },
  {
    id: "wave",
    name: "Wave",
    element: "water",
    damage: 5,
    manaCost: ["water"],
  },
  {
    id: "bolt",
    name: "Bolt",
    element: "lightning",
    damage: 5,
    manaCost: ["lightning"],
  },
  {
    id: "roots",
    name: "Roots",
    element: "nature",
    damage: 5,
    manaCost: ["nature"],
  },
];
