import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCHEMA_SQL = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

/** Idempotent -- CREATE TABLE/INDEX IF NOT EXISTS, safe to run on every server boot. */
export async function ensureSchema() {
  await pool.query(SCHEMA_SQL)
}
