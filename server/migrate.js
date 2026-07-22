// Standalone migration runner: `npm run db:migrate`. The API server also
// calls ensureSchema() on boot, so this is mainly for setting up the table
// ahead of time (or re-running it as a sanity check).

import { ensureSchema } from './ensureSchema.js'
import { pool } from './db.js'

try {
  await ensureSchema()
  console.log('characters table ready.')
} finally {
  await pool.end()
}
