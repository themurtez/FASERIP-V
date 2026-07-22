// Minimal API server backing the "auto-save generated characters" feature.
// Run with `npm run server` (or `npm run dev:all` to run it alongside Vite).
// The Vite dev server proxies /api/* here (see vite.config.ts).

import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { ensureSchema } from './ensureSchema.js'

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001

const app = express()
app.use(cors())
// Bulk-generate can post thousands of characters in one request; 1mb only
// covers a handful, so the limit is raised for both routes.
app.use(express.json({ limit: '20mb' }))

// Column order shared by the single-insert and bulk-insert routes below --
// keeping it in one place means the two INSERTs can't drift out of sync.
const CHARACTER_COLUMNS = [
  'character_id', 'player', 'name', 'identity', 'char_group', 'base', 'hair', 'eyes', 'weight', 'height', 'skin', 'age',
  'origin', 'physical_form', 'occupation', 'notes',
  'fighting', 'agility', 'strength', 'endurance', 'reason', 'intuition', 'psyche',
  'health', 'karma', 'resources', 'popularity',
  'weakness_stimulus', 'weakness_effect', 'weakness_duration',
  'powers_count', 'powers_max', 'powers',
  'talents_count', 'talents_max', 'talents',
  'background',
]

function characterRowValues(b) {
  return [
    b.characterId, b.player, b.name, b.identity, b.charGroup, b.base, b.hair, b.eyes, b.weight, b.height, b.skin, b.age,
    b.origin, b.physicalForm, b.occupation, b.notes,
    b.fighting, b.agility, b.strength, b.endurance, b.reason, b.intuition, b.psyche,
    b.health, b.karma, b.resources, b.popularity,
    b.weaknessStimulus, b.weaknessEffect, b.weaknessDuration,
    b.powersCount, b.powersMax, JSON.stringify(b.powers ?? []),
    b.talentsCount, b.talentsMax, b.talents ?? [],
    b.background,
  ]
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) })
  }
})

app.post('/api/characters', async (req, res) => {
  const b = req.body ?? {}

  try {
    const result = await pool.query(
      `INSERT INTO characters (${CHARACTER_COLUMNS.join(', ')})
       VALUES (${CHARACTER_COLUMNS.map((_, i) => `$${i + 1}`).join(', ')})
       RETURNING id, created_at`,
      characterRowValues(b),
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('POST /api/characters failed:', err)
    res.status(500).json({ error: String(err) })
  }
})

// Bulk-generate save path (see src/components/dialogs/BulkGenerateDialog.vue):
// accepts an arbitrarily large `characters` array in one request and inserts
// it in chunked multi-row statements inside a single transaction, rather
// than one round-trip per character. Chunk size keeps each statement's
// parameter count (37 columns * chunk size) safely under Postgres's 65535
// bound parameter limit.
const BULK_INSERT_CHUNK_SIZE = 500

app.post('/api/characters/bulk', async (req, res) => {
  const characters = Array.isArray(req.body?.characters) ? req.body.characters : []
  if (!characters.length) {
    res.status(400).json({ error: 'Expected a non-empty "characters" array.' })
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let inserted = 0
    for (let i = 0; i < characters.length; i += BULK_INSERT_CHUNK_SIZE) {
      const chunk = characters.slice(i, i + BULK_INSERT_CHUNK_SIZE)
      const values = []
      const rowPlaceholders = chunk.map((b, row) => {
        values.push(...characterRowValues(b))
        const base = row * CHARACTER_COLUMNS.length
        const placeholders = CHARACTER_COLUMNS.map((_, col) => `$${base + col + 1}`)
        return `(${placeholders.join(', ')})`
      })
      await client.query(
        `INSERT INTO characters (${CHARACTER_COLUMNS.join(', ')}) VALUES ${rowPlaceholders.join(', ')}`,
        values,
      )
      inserted += chunk.length
    }
    await client.query('COMMIT')
    res.status(201).json({ inserted })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('POST /api/characters/bulk failed:', err)
    res.status(500).json({ error: String(err) })
  } finally {
    client.release()
  }
})

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Character-save API listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to prepare database schema:', err)
    process.exit(1)
  })
