export interface HocuspocusServerConfig {
  host: string;
  port: number;
}

export interface ExpressServerConfig {
  host: string;
  port: number;
}

export interface BbbWebConfig {
  host: string;
  port: string;
  checkAuthorizationEndpoint: string;
}

export interface LogConfig {
  level: string;
}

export interface RedisChannelsConfig {
  publish: string[];
  subscribe: string[];
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string | null;
  channels: RedisChannelsConfig;
}

export interface BbbPostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface SqliteConfig {
  database: string;
}

export interface AppSettings {
  expressServer: ExpressServerConfig;
  hocuspocusServer: HocuspocusServerConfig;
  bbbWeb: BbbWebConfig;
  log: LogConfig;
  redis: RedisConfig;
  bbbPostgres: BbbPostgresConfig;
  sqlite: SqliteConfig;
}
