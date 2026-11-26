import { Database } from '@hocuspocus/extension-database'
import pkg from 'pg'
const { Pool } = pkg
import config from "../../config";

// The settings one by one, not as a URL: a password with "@", ":" or "/" breaks a URL
const pool = new Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
})

const postgresqlDB = new Database({
  fetch: async ({ documentName }) => {
    const result = await pool.query(
      'SELECT content FROM documents WHERE name = $1',
      [documentName]
    )
    return result.rows[0]?.content
  },
  store: async ({ documentName, state }) => {
    await pool.query(
      'INSERT INTO documents (name, content) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET content = $2',
      [documentName, state]
    )
  }
});

export const markDocumentEnded = async (documentName: string): Promise<void> => {
  await pool.query(
    'UPDATE documents SET ended_at = NOW() WHERE name = $1',
    [documentName]
  )
}

export const removeExpiredDocuments = async (): Promise<number> => {
  const result = await pool.query(
    "DELETE FROM documents WHERE ended_at IS NOT NULL AND ended_at < NOW() - MAKE_INTERVAL(mins => $1)",
    [config.postgres.documentExpireMinutesAfterMeetingEnd]
  )
  return result.rowCount ?? 0
}

export default postgresqlDB;
