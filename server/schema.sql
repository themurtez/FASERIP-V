-- Generated-character archive. One row per full "Generate All" roll (or
-- "New Character"), written when auto-save is enabled (Options menu).
--
-- Everything is its own column, holding plain numbers for anything with a
-- rank (Primary/Secondary Abilities, and each Power's level) rather than the
-- rank name ("Excellent" etc) -- except the Powers list itself, which is
-- JSON since each entry needs a name/category/level triplet. Talents have no
-- rank, so they're a flat Postgres text array rather than JSON.
CREATE TABLE IF NOT EXISTS characters (
  id SERIAL PRIMARY KEY,
  character_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Basic Info
  player TEXT,
  name TEXT,
  identity TEXT,
  char_group TEXT, -- "group" is a reserved word
  base TEXT,
  hair TEXT,
  eyes TEXT,
  weight TEXT,
  height TEXT,
  skin TEXT,
  age TEXT,
  origin TEXT,
  physical_form TEXT,
  occupation TEXT,
  notes TEXT,

  -- Primary Abilities -- rank numbers only, never rank names
  fighting INTEGER,
  agility INTEGER,
  strength INTEGER,
  endurance INTEGER,
  reason INTEGER,
  intuition INTEGER,
  psyche INTEGER,

  -- Secondary Abilities
  health INTEGER,
  karma INTEGER,
  resources INTEGER,
  popularity INTEGER,

  -- Weakness
  weakness_stimulus TEXT,
  weakness_effect TEXT,
  weakness_duration TEXT,

  -- Powers
  powers_count INTEGER,
  powers_max INTEGER,
  powers JSONB, -- [{ "name": "...", "category": "...", "level": <rank number> }, ...]

  -- Talents
  talents_count INTEGER,
  talents_max INTEGER,
  talents TEXT[],

  background TEXT
);

CREATE INDEX IF NOT EXISTS characters_character_id_idx ON characters (character_id);
CREATE INDEX IF NOT EXISTS characters_created_at_idx ON characters (created_at);
