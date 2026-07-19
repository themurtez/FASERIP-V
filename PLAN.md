# FASERIP Character Generator — Build Plan

## 1. What we're building

A browser-based character generator for the **FASERIP** system (TSR's *Marvel Super Heroes* RPG — the acronym is the seven Primary Abilities: **F**ighting, **A**gility, **S**trength, **E**ndurance, **R**eason, **I**ntuition, **P**syche).

- Vue 3 + PrimeVue, client-side only, no backend.
- Content/layout modeled on the provided **Java Marvel Character Creator** screenshot ("HMCC").
- Random generation follows the **Ultimate Powers Book** 7-step method from `rules.pdf`.
- Powers list sourced from `Classic Marvel Forever – Ultimate Powers List.html`.
- Characters are the unit of persistence: **export to JSON**, **import from JSON**. No server, no accounts.
- Every generatable field gets a **lock toggle** (not in the reference screenshot, but requested): when locked, that field is skipped by any "Generate" action until unlocked.

Reference files stay at the repo root (`rules.pdf`, the powers-list HTML, the screenshot). The app is scaffolded alongside them.

---

## 2. Source material — what we actually have

### 2.1 Screenshot (interface reference)

Title bar "Java Marvel Character Creator", menu bar **File / Generate / Options**. Three-column sheet layout:

| Region | Fields |
|---|---|
| **Basic Info** | Player, Name, Identity, Group, Base, Hair, Weight, Skin, Age, Eyes, Height, Origin (dropdown), Form (dropdown), Occupation (dropdown), free-text notes box (e.g. "+1CS Initial Resources") |
| **Weakness** | Stimulus, Effect, Duration (all dropdowns) |
| **Primary Abilities** | Health, Karma (computed), then Fighting / Agility / Strength / Endurance / Reason / Intuition / Psyche / Resources — each shown as `RANK(number)` e.g. `TY(5)`, `EX(16)`, with **+ / − / #** buttons |
| **Powers** | "Number of Powers" `current/max` counter + reroll; 16 numbered slots, each with a power-name dropdown, `RANK(number)` badge, **+ / − / #** |
| **Talents** | "Number of Talents" `current/max` counter + reroll; 8 numbered talent-name dropdowns |
| **Nav** | `‹ ›` chevrons on the far left/right edges — read as paging to additional sheet pages (Contacts / Background — not shown in the screenshot, see §5) |

Interpretation of the per-row controls (inferred, not labeled in the screenshot — flagged so it's easy to correct once we're looking at it live):
- **+ / −**: shift the rank one Column Shift (CS) up/down.
- **#**: reroll *just this field* using its table, ignoring nothing except its own lock.
- Power/Talent dropdown: manually pick a specific entry (an explicit pick always counts as "filled in," independent of lock).

### 2.2 `rules.pdf` (11 pages, an excerpt of the Ultimate Powers Book)

The 7-step generation method: **Physical Form → Origin of Power → Primary Abilities → Secondary Abilities → Weakness → Powers → "give your character life"**.

Extracted and usable directly:
- **Rank name → Initial Rank Number** (this is what the screenshot's `TY(5)` etc. is showing): Feeble=1, Poor=3, Typical=5, Good=8, Excellent=16, Remarkable=26, Incredible=36, Amazing=46, Monstrous=63. This matches the screenshot exactly, so it's the canonical table for this app — note it's **lower** than the "standard" published MSH rank numbers (Typical=6, Excellent=20, etc.); we intentionally follow the book/screenshot numbers, not the general-knowledge ones.
- **Origin of Power** table (11 origins, full dice ranges: Natal, Maturity, Self-Achievement, Endowment, Technical Mishap, Technical Procedure, Creation, Biological Exposure, Chemical Exposure, Energy Exposure, Rebirth).
- **Weakness** tables: Stimulus (7 options), Effect (3: Power Negation / Incapacitation / Fatal), Duration (4), all with full dice ranges.
- **Physical Form** — full descriptive text for ~40 body types (Normal Human, Induced/Random/Breed Mutant, Android, Humanoid Race, Surgical Composite, Modified Human variants, 10 Demihuman variants, 4 Cyborg variants, 4 Robot variants, Angel/Demon, Deity, Animal, Vegetable, Abnormal Biochemistry, Mineral/Liquid/Gaseous/Energy/Ethereal/Undead, Compound, Changeling), each with its stat modifiers and which **Random Ranks Table column** (1–5) it rolls Primary Abilities on.
- **Random Ranks Table**: 5 columns × 9 rank tiers (Feeble→Monstrous). The PDF's text extraction scrambled this table's layout; we reconstructed it from context and it's internally consistent (each column's ranges span 01→00), but it's flagged **medium confidence** — worth a manual sanity-check against the original book if precision matters later.
- Definitions: Bonus Power, Optional Power, Nemesis (used for how certain rolled powers pull in other powers).

**Explicitly NOT in this excerpt** (the PDF says outright it's "only a capsule version" and assumes you own the Original/Advanced boxed sets):
- Exact dice-roll % table for *which* Physical Form you get (we have the type list + modifiers + column assignment, not the top-level percentage table — it garbled the same way the Random Ranks Table did, but without enough context to safely reconstruct it).
- How many Powers a character starts with, and how a given Power's starting rank is rolled.
- Talents list and talent-count table.
- Contacts generation.
- Popularity's specific starting table (Resources/Popularity are said to reuse the Random Ranks Table, but not which column per Physical Form).
- The "give your character life" step (background) beyond the name.

All of this is stubbed — see §6.

### 2.3 Powers list HTML

Parsed programmatically (not by hand — 456 entries is too much to transcribe reliably) into structured data via `scripts/extract-powers.py`:

- **456 powers** across the **16 categories** from the master roll table (Defensive, Detection, Energy Control, Energy Emission, Fighting, Illusionary, Life Control, Magic, Matter Control, Matter Conversion, Matter Creation, Mental Enhancement, Physical Enhancement, Power Control, Self-Alteration, Travel), each with its own sub-table roll range, name, and full description.
- 66 powers flagged `godly`, 9 flagged `cosmic` (source used `*` / `**`) — kept as a `tier` field.
- A handful of auxiliary reference tables (Richter-scale intensity, multiple-actions-per-rank, duplication count, growth/shrink size charts) that are really addenda to *specific* powers (Earthquake, Hyper-Speed, Duplication, Growth, Shrinking) rather than standalone powers — stored as supplementary lookup tables, not character-facing fields, for now.

This is the one dataset that's genuinely complete and doesn't need stubbing → `src/data/powers.json`.

### 2.4 Talents list HTML

A second source file (Ultimate Talents List) appeared partway through this build, so this is **not stubbed either** — parsed the same way via `scripts/extract-talents.py`:

- **211 talents** across **16 categories** (Alternative Sciences, Astronomy, Biology, Chemistry, Crime and Law, Cognitive Sciences & Humanities, Computer Science, Earth Sciences, Engineering, Fighting Skills, Medicine, Mystic and Mental Skills, Other, Physics, Piloting Skills, Weapons Skills), each with roll range, name, and description.
- Same category-roll-then-item-roll structure as Powers: roll once on the 16-category master table, then roll again on that category's own list.

→ `src/data/talents.json`. The only remaining stub from the original Talents-related gap is the **talent count table** (how many Talents a character starts with, screenshot shows `1/4`) — that determination isn't in `rules.pdf`.

---

## 3. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Vue 3 (`<script setup>`, TS) | requested |
| Build tool | Vite | standard Vue 3 tooling |
| UI kit | PrimeVue **4.5.5** (exact-pinned), Aura theme via `@primevue/themes@4.5.4`, `primeicons@7.0.0` | requested. **Pinned on purpose:** PrimeVue 5.0.0 shipped 2026-07-15 (literally during this build) and switched to a commercial "PrimeUI" license — components now show an "Invalid PrimeUI License" banner without a registered key. 4.5.5 is the last plain-MIT release with an identical API for everything used here (Select, Menubar, Fieldset, etc.). `package.json` pins exact versions (no `^`) so a routine `npm install`/`npm update` can't silently pull the licensed line back in. If you specifically want PrimeVue 5's newer features later, see §9. |
| State | Pinia | official Vue state store |
| Language | TypeScript | this app is basically "tables + rules on structured data" — types pay for themselves immediately |
| Persistence | none (by design) | character state lives in the Pinia store; **export/import JSON** is the save/load mechanism, per the request |
| Router | none (yet) | single view; the screenshot's `‹ ›` chevrons are modeled as an in-component page stepper, not routes (§5) |

No backend, no auth, no database — a static site that could be hosted anywhere (or just run locally).

---

## 4. Character JSON — the import/export contract

This is the one format that matters most since it's both the save format and the wire format. Every generatable leaf is `{ value/rank, locked }` so the lock feature is uniform everywhere.

```jsonc
{
  "schemaVersion": 1,
  "id": "uuid-v4",
  "meta": { "createdAt": "ISO-8601", "updatedAt": "ISO-8601" },

  "basicInfo": {
    "player": "", "name": "", "identity": "", "group": "", "base": "",
    "hair": "", "eyes": "", "weight": "", "height": "", "skin": "", "age": "",
    "origin":       { "value": "Biological Exposure", "locked": false },
    "physicalForm": { "value": "Normal Human",         "locked": false },
    "occupation":   { "value": "Consulting",           "locked": false },
    "notes": "+1CS Initial Resources"
  },

  "primaryAbilities": {
    "fighting":  { "rank": "Typical", "rankNumber": 5, "locked": false },
    "agility":   { "rank": "Typical", "rankNumber": 5, "locked": false },
    "strength":  { "rank": "Excellent", "rankNumber": 16, "locked": false },
    "endurance": { "rank": "Good", "rankNumber": 8, "locked": false },
    "reason":    { "rank": "Typical", "rankNumber": 5, "locked": false },
    "intuition": { "rank": "Typical", "rankNumber": 5, "locked": false },
    "psyche":    { "rank": "Poor", "rankNumber": 3, "locked": false }
  },

  "secondaryAbilities": {
    "health":     { "value": 34, "locked": false },
    "karma":      { "value": 13, "locked": false },
    "resources":  { "rank": "Excellent", "rankNumber": 16, "locked": false },
    "popularity": { "rank": "Typical", "rankNumber": 5, "locked": false }
  },

  "weakness": {
    "stimulus": { "value": "Elemental Allergy", "locked": false },
    "effect":   { "value": "Fatal", "locked": false },
    "duration": { "value": "Limited Duration after Contact", "locked": false }
  },

  "powers": {
    "count": { "current": 5, "max": 7, "locked": false },
    "slots": [
      { "slot": 1, "name": "Shadow Casting", "category": "Self-Alteration", "rank": "Feeble", "rankNumber": 1, "locked": false }
    ]
  },

  "talents": {
    "count": { "current": 1, "max": 4, "locked": false },
    "slots": [ { "slot": 1, "name": "Civil Engineering", "locked": false } ]
  },

  "contacts": { "slots": [] },
  "background": ""
}
```

Health = Fighting + Agility + Strength + Endurance (rank numbers). Karma = Reason + Intuition + Psyche (rank numbers). Both computed but stored with their own `locked` flag so a manual override sticks.

Import validates `schemaVersion` and shape before loading; unknown/missing fields fall back to defaults rather than failing the whole import.

---

## 5. Layout plan

Single view, three-column CSS grid mirroring the screenshot's grouping (not pixel-identical — matching content, per the request):

```
┌─────────────────────────── menu bar: File · Generate · Options ───────────────────────────┐
│ ‹                                                                                          › │
│   ┌─ Basic Info ─────────┐   ┌─ Weakness ───────────┐   ┌─ Powers ──────────────────────┐  │
│   │ ...                  │   │ ...                  │   │  count  1..16 slots           │  │
│   ├─ Primary Abilities ──┤   ├─ Talents ─────────────┤   │                                │  │
│   │ Health / Karma       │   │ count, 1..8 slots     │   │                                │  │
│   │ F A S E R I P + Res  │   │                       │   │                                │  │
│   └──────────────────────┘   └───────────────────────┘   └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

The `‹ ›` chevrons become a page stepper: **Page 1** is everything above (matches the screenshot). **Page 2** is stubbed now (Contacts, Background/"give your character life", Popularity if we want it more prominent) so the paging mechanism exists and there's an obvious place to drop those in later — same idea as the mocked data.

**Lock affordance**: a small lock/unlock icon added next to every control cluster that doesn't have one in the reference — next to each ability's `+ − #`, each power/talent slot, each dropdown (Origin/Form/Occupation/Stimulus/Effect/Duration), and each count-reroll (`Number of Powers`/`Number of Talents`). One shared `LockToggle` component, one shared visual treatment (dimmed/outlined background on the row when locked) so it reads consistently everywhere instead of being bolted on per-panel.

---

## 6. What's mocked vs real, and why that split

The request was to start with a fully working interface with everything mocked, so pieces can be dropped in as they're ready. Splitting it this way:

**Real from day one** (already extracted, no reason to fake it):
- Powers list (456 entries, categories, descriptions) → power-picker dropdowns and `#` reroll pull from real data immediately.
- Talents list (211 entries, categories, descriptions) → same treatment as Powers.
- Rank names + Initial Rank Numbers (Feeble→Monstrous, from the book) and the extended ladder (Unearthly, Shift X/Y/Z, Class 1000/3000/5000 — standard published values, not in this excerpt, added so manual rank selection isn't artificially capped).
- Origin of Power table, Weakness tables, Physical Form type list + modifiers.

**Mocked in Phase 1, real table in Phase 2** (the generation *engine* exists and is wired to the UI now; it starts out picking uniformly at random from the applicable list, then gets swapped for the actual weighted dice table without touching any component code — same function signatures):
- Physical Form roll weighting (need the real top-level percentages).
- Random Ranks Table column weighting per ability (we have a reconstructed version — flagged for verification, usable as the "real" version once confirmed).
- Power count (how many powers to start with) and a rolled power's starting rank; same for Talent count.
- Resources/Popularity's column assignment.

**Stubbed placeholder data** (genuinely absent from the source material — placeholder now, swap the data file later, zero component changes):
- Occupations list (screenshot shows "Consulting" — we'll seed a small placeholder list in the same shape).
- Contacts generation.
- "Give your character life" background — free-text field only, no generator.

Every generator function lives behind the same interface (`generate(character, field, rng)`) regardless of which tier above it's in, specifically so Phase 2 is "replace the table this function reads from," not "rewrite the function."

---

## 7. Project structure

```
FASERIP-V/
  rules.pdf, *.html, *.png        # existing reference material, untouched
  PLAN.md
  scripts/
    extract-powers.py             # regenerates src/data/powers.json from the source HTML
    extract-talents.py            # regenerates src/data/talents.json from the source HTML
  src/
    types/character.ts            # the §4 schema, as TS types
    data/
      powers.json                 # 456 parsed powers
      talents.json                # 211 parsed talents
      ranks.ts                    # rank name <-> number ladder
      origins.ts
      weaknesses.ts
      physicalForms.ts
      randomRanksTable.ts         # the 5-column table (flagged confidence in comments)
      occupations.ts              # STUB placeholder list
    stores/
      character.ts                # Pinia store: character state + lock flags + actions
    generators/
      dice.ts                     # d100 roll + table-lookup helpers
      physicalForm.ts, origin.ts, abilities.ts, weakness.ts, powers.ts, talents.ts
    components/
      layout/AppMenuBar.vue, CharacterSheet.vue
      panels/BasicInfoPanel.vue, WeaknessPanel.vue, PrimaryAbilitiesPanel.vue,
             PowersPanel.vue, TalentsPanel.vue, ContactsBackgroundPanel.vue (stub page 2)
      shared/RankControl.vue      # rank badge + / − / # / lock, reused by abilities & powers
             LockToggle.vue
    composables/useCharacterIO.ts # export/import JSON (File System Access API w/ download-link fallback)
    App.vue, main.ts
  package.json, vite.config.ts, tsconfig.json, index.html
```

---

## 8. Phased delivery

**Phase 0 — Scaffold.** Vite + Vue 3 + TS project, PrimeVue/PrimeIcons/Pinia wired up, base layout shell renders.

**Phase 1 — Mocked interactive interface (current focus).** Every panel from §5 built and laid out, backed by the Pinia store and real reference data (§6 "real" tier) plus uniform-random mocked generation for anything without a confirmed weighted table yet. File → Export/Import JSON works against the §4 schema. Generate menu triggers per-section and "generate all," respecting locks. Lock toggles work everywhere. This is the deliverable that lets us click around and see the whole thing functioning end to end.

**Phase 2 — Real generation engine.** Swap in confirmed weighted tables as they're verified (Physical Form %, Random Ranks Table columns, power count/rank rolls, Resources/Popularity column mapping). No component changes expected — only `src/data/*` and `src/generators/*`.

**Phase 3 — Import/export polish.** Schema versioning/migration, validation errors surfaced in the UI, maybe a character roster (multiple saved characters in local storage) if wanted.

**Phase 4 — Nice-to-haves, only if wanted.** Print/PDF-style view, dark mode, page 2 (Contacts/Background) fully built out, Talents/Occupations real tables once sourced.

---

## 9. Open items to confirm along the way (non-blocking — reasonable defaults chosen, flagged for override)

- Physical Form's exact roll-percentage table and the Random Ranks Table reconstruction (§2.2) — worth checking against the original book if exact odds matter.
- Whether Resources/Popularity really share their Physical Form's Primary Ability column, or roll on a fixed column regardless of form.
- Real Occupations list (currently a placeholder) and the Talent-count table (currently mocked).
- Whether "Number of Powers"/"Number of Talents" `current/max` means *(rolled count)/(cap allowed by rules)* — that's the working assumption.
- **PrimeVue version.** Pinned to the last MIT release (4.5.5) rather than 5.0's new licensed line (§3). Moving to 5.x later is possible (its Community License is free for non-commercial/individual use) but needs someone to register at primeui.dev for a key and re-confirm eligibility annually — a deliberate call for the user to make, not something to switch to silently.
