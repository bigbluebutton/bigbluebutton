import { Database } from '@hocuspocus/extension-database'
import pkg from 'pg'
const { Pool } = pkg
import { config } from "../../config";

const connectionString = `postgres://${config.postgres.user}:${config.postgres.password}@${config.postgres.host}:${config.postgres.port}/${config.postgres.database}`

const pool = new Pool({
  connectionString
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

export default postgresqlDB;
