// Physical Form types -- rules.pdf pages 1-8. Each type's name, which
// Random Ranks Table column it uses, and its flavor/mechanical modifiers are
// cleanly extracted from the descriptive text.
//
// NOT included: the top-level dice-roll % for *which* Physical Form you get.
// That table's layout got scrambled the same way the Random Ranks Table's
// did, but without enough surrounding context to safely reconstruct it (see
// PLAN.md §2.2/§6) -- so Phase 1 picks a Physical Form uniformly at random
// from this list rather than weighting toward "Normal Human" the way the
// real table almost certainly does. Swap in real weights (`min`/`max` on
// each entry) once sourced, no generator code should need to change.
//
// `modifiers` is reference text for the player, shown alongside the pick --
// none of these bespoke bonuses (e.g. "+1CS Strength") are auto-applied to
// the ability scores. Auto-applying ~40 bespoke rulesets is out of scope for
// now; the Notes field is where a player jots down what applies.

import type { PhysicalFormEntry } from '@/types/reference'

export const PHYSICAL_FORMS: PhysicalFormEntry[] = [
  { name: 'Normal Human', group: 'Human', column: 2, modifiers: 'Resources +1CS.' },
  {
    name: 'Induced Mutant',
    group: 'Mutant',
    column: 1,
    modifiers: 'May raise any one Primary Ability +1CS.',
  },
  {
    name: 'Random Mutation',
    group: 'Mutant',
    column: 1,
    modifiers: 'Gains one additional Power. Resources -1CS. Endurance +1CS.',
  },
  {
    name: 'Breed Mutant',
    group: 'Mutant',
    column: 1,
    modifiers: 'Intuition +1CS. Endurance +1CS. Must have at least one Contact (usually their tribe).',
  },
  {
    name: 'Android',
    group: 'Artificial',
    column: 4,
    modifiers:
      'Popularity initially -1CS. May raise any one Ability +1CS. Gains one Power. Has a Contact (creator).',
  },
  {
    name: 'Humanoid Race',
    group: 'Human',
    column: 5,
    modifiers: 'May raise any one Ability +1CS. Starting Resources are Poor. One Contact (their race).',
  },
  {
    name: 'Surgical Composite',
    group: 'Human',
    column: 2,
    modifiers:
      'Strength, Fighting, Endurance +1CS. Resistance to Mental Domination -1CS. Initial Popularity zero. Initial Resources Poor. Heals twice as fast.',
  },
  {
    name: 'Modified Human - Organic',
    group: 'Modified Human',
    column: 1,
    modifiers: 'Heals twice as fast as Normal Humans. One less Power initially.',
  },
  {
    name: 'Modified Human - Muscular',
    group: 'Modified Human',
    column: 1,
    modifiers: 'Strength and Endurance +1CS. One less Power initially.',
  },
  {
    name: 'Modified Human - Skeletal',
    group: 'Modified Human',
    column: 1,
    modifiers: 'Resistance to Physical Attacks +1CS. One less Power initially.',
  },
  {
    name: 'Modified Human - Extra Parts',
    group: 'Modified Human',
    column: 1,
    modifiers:
      'Arms raise Fighting +1CS. Duplicate organs double Health. Tails give an extra attack per tail. Wings give Flight. One less Power initially.',
  },
  {
    name: 'Centaur',
    group: 'Demihuman',
    column: 5,
    modifiers: 'Strength +1CS. Moves 4 areas/turn. Feeble Climbing. Popular as scholars or drunken lechers.',
  },
  {
    name: 'Equiman',
    group: 'Demihuman',
    column: 3,
    modifiers: 'Kicking does +1CS damage.',
  },
  {
    name: 'Faun',
    group: 'Demihuman',
    column: 2,
    modifiers: 'Feeble Mental Domination over females of any human(oid) race. Initial Popularity zero.',
  },
  {
    name: 'Felinoid',
    group: 'Demihuman',
    column: 1,
    modifiers: 'Climbing +1CS. Excellent night vision.',
  },
  {
    name: 'Lupinoid',
    group: 'Demihuman',
    column: 4,
    modifiers: 'Excellent sense of smell. Popularity varies (-1CS from some, offset by others).',
  },
  {
    name: 'Avian - Angel',
    group: 'Demihuman',
    column: 3,
    modifiers: 'Popularity +1CS. Wings (reproduces by normal human means).',
  },
  {
    name: 'Avian - Harpy',
    group: 'Demihuman',
    column: 2,
    modifiers: 'Fighting +1CS. Arms double as wings. Lays eggs.',
  },
  {
    name: 'Chiropteran',
    group: 'Demihuman',
    column: 2,
    modifiers: 'Active Sonar at Good rank. Initial Popularity Feeble.',
  },
  {
    name: 'Lamian',
    group: 'Demihuman',
    column: 3,
    modifiers: '50% chance venomous (Excellent Intensity poison). Initial Popularity zero. +1CS to escape binds.',
  },
  {
    name: 'Merhuman',
    group: 'Demihuman',
    column: 2,
    modifiers: 'Has Water Freedom. Popularity +1CS. Movement on dry land is limited.',
  },
  {
    name: 'Other Demihuman',
    group: 'Demihuman',
    column: 5,
    columnAssumed: true,
    modifiers: 'Custom animal/human combination -- work out reasonable stats with the Judge.',
  },
  {
    name: 'Cyborg - Limb/Organ',
    group: 'Cyborg',
    column: 3,
    columnAssumed: true,
    modifiers: 'Intuition initially -1CS. At least one Contact (the lab/hospital that created them).',
  },
  {
    name: 'Cyborg - Exoskeleton',
    group: 'Cyborg',
    column: 3,
    columnAssumed: true,
    modifiers: 'Natural and artificial bodies exist in symbiosis (e.g. a powered suit).',
  },
  {
    name: 'Cyborg - Mechanical Body',
    group: 'Cyborg',
    column: 4,
    modifiers:
      'Intuition and Psyche -1CS. Monstrous Resistance to Disease/Poison. Vulnerable to Magnetic attacks and rust.',
  },
  {
    name: 'Cyborg - Mechanically Augmented',
    group: 'Cyborg',
    column: 3,
    modifiers: 'One less Power initially. Initial Resources Good, or optionally rolled.',
  },
  {
    name: 'Robot - Humanshape',
    group: 'Robot',
    column: 4,
    modifiers: 'Initial Popularity zero. Self-repair simulates normal Healing.',
  },
  {
    name: 'Robot - Usuform',
    group: 'Robot',
    column: 4,
    modifiers: "Body form follows function (built around its Powers). Popularity generally unaffected.",
  },
  {
    name: 'Robot - Metamorphic',
    group: 'Robot',
    column: 4,
    modifiers: 'Minimum two forms. -1CS to all Primary Abilities for each additional form beyond two.',
  },
  {
    name: 'Robot - Computer',
    group: 'Robot',
    column: 4,
    modifiers:
      'Reason +2CS. Fighting -1CS. Resources +1CS. Decreased Resistance to Electrical/Magnetic attacks and Phasing.',
  },
  {
    name: 'Angel',
    group: 'Angel/Demon',
    column: 5,
    modifiers:
      'All Physical Abilities +1CS. Popularity +2CS. Bonus: magic sword (Artifact Creation, Excellent damage).',
  },
  {
    name: 'Demon',
    group: 'Angel/Demon',
    column: 5,
    modifiers:
      'All Physical Abilities +1CS. Popularity -2CS. Auto Good Fire Generation + Invulnerability to Fire.',
  },
  {
    name: 'Deity',
    group: 'Deity',
    column: 5,
    modifiers:
      'All Primary Abilities +2CS. Two additional Powers. Automatically has at least one Travel Power. Popularity +2CS (public) / zero (established religions).',
  },
  {
    name: 'Animal',
    group: 'Animal',
    column: 1,
    modifiers:
      'One less Power. Two Detection Powers at Good rank. Resources zero unless bonded to a human. (Aliens in this category use Column 5.)',
  },
  {
    name: 'Vegetable',
    group: 'Vegetable',
    column: 1,
    modifiers:
      'Resources zero. Auto Good Absorption (photosynthesis). Fighting -2CS. Endurance +2CS.',
  },
  {
    name: 'Abnormal Biochemistry',
    group: 'Exotic Matter',
    column: 2,
    modifiers: 'Endurance +1CS. Different body chemistry (e.g. silicon/copper/cobalt based).',
  },
  {
    name: 'Mineral Life',
    group: 'Exotic Matter',
    column: 2,
    modifiers: 'Initial Health doubled. Movement rate -1CS.',
  },
  {
    name: 'Liquid Life',
    group: 'Exotic Matter',
    column: 5,
    modifiers: 'Natural Phasing through porous materials. No initial Contacts except own race, if any.',
  },
  {
    name: 'Gaseous Life',
    group: 'Exotic Matter',
    column: 5,
    modifiers: 'Resources zero. No initial Contacts. Natural Phasing through solids.',
  },
  {
    name: 'Energy Body',
    group: 'Exotic Matter',
    column: 5,
    modifiers:
      'Bonus Power: Energy Emission. Resistance to Plasma Control -1CS. Physical contact with others does Feeble damage.',
  },
  {
    name: 'Ethereal',
    group: 'Exotic Matter',
    column: 1,
    modifiers: 'Fighting is zero on Earth (unless fighting another Ethereal). Physical attacks -9CS effect.',
  },
  {
    name: 'Undead',
    group: 'Exotic Matter',
    column: 1,
    modifiers: 'Strength and Endurance +1CS. Psychological Weakness near religious symbols.',
  },
  {
    name: 'Compound',
    group: 'Compound',
    column: 3,
    columnAssumed: true,
    modifiers: 'Body combines 2-5 Body Types (rolled); retains a mix of their advantages/disadvantages.',
  },
  {
    name: 'Changeling',
    group: 'Compound',
    column: 5,
    modifiers:
      '2-5 Aspects, each with its own unique Power. 10 turns to transform between Aspects; -2CS all Primary Abilities while transforming.',
  },
]

export function physicalFormByName(name: string): PhysicalFormEntry | undefined {
  return PHYSICAL_FORMS.find((f) => f.name === name)
}
