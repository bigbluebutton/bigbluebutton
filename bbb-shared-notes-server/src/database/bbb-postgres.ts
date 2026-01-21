import { Pool, PoolClient, PoolConfig } from 'pg';
import { Logger } from '../common/logger';
import { PostgresConfig } from './type';
import { config } from '../config';
import { prePopulateMeetingLockMap } from './helper';

const logger = new Logger('PostgreSQL');

class PostgresConnection {
  private static instance: PostgresConnection;
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): PostgresConnection {
    if (!PostgresConnection.instance) {
      PostgresConnection.instance = new PostgresConnection();
    }
    return PostgresConnection.instance;
  }

  public async connect(config: PostgresConfig): Promise<void> {
    if (this.isConnected) {
      logger.warn('PostgreSQL already connected');
      return;
    }

    try {
      const poolConfig: PoolConfig = {
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        max: config.max || 20,
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMillis || 2000,
      };

      this.pool = new Pool(poolConfig);

      this.pool.on('error', (err: Error) => {
        logger.error('Unexpected error on idle PostgreSQL client', err);
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.isConnected = true;
      logger.info('PostgreSQL connection established successfully');
    } catch (error) {
      logger.error('Failed to connect to PostgreSQL', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.pool) {
      logger.warn('PostgreSQL is not connected');
      return;
    }

    try {
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      logger.info('PostgreSQL connection closed');
    } catch (error) {
      logger.error('Error closing PostgreSQL connection', error as Error);
      throw error;
    }
  }

  public async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('PostgreSQL is not connected');
    }

    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      logger.error('PostgreSQL query error', { query: text, error: (error as Error).message });
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('PostgreSQL is not connected');
    }

    try {
      return await this.pool.connect();
    } catch (error) {
      logger.error('Error getting PostgreSQL client', error as Error);
      throw error;
    }
  }

  public getPool(): Pool | null {
    return this.pool;
  }

  public isPoolConnected(): boolean {
    return this.isConnected;
  }
}

const pgInstance = PostgresConnection.getInstance();


const startPostgres = async () => {
  await pgInstance.connect(config.bbbPostgres);

  await prePopulateMeetingLockMap();
}

export default pgInstance

export { startPostgres };
