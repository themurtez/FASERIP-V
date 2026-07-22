// Postgres connection pool, shared by the API server and the migration
// script. Connection info comes from .env (DATABASE_URL, or the individual
// DB_* vars as a fallback) -- run with `node --env-file=.env` (see
// package.json's `server`/`db:migrate` scripts) so these are populated.

import pg from 'pg'

const { Pool } = pg

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL }
  }
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
}

export const pool = new Pool(buildConfig())
