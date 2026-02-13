export interface HocuspocusServerConfig {
  host: string;
  port: number;
}

export interface ExpressServerConfig {
  host: string;
  port: number;
  maxContentLength: number; // In kB
}

export interface BbbWebConfig {
  host: string;
  port: string;
  presentationEndpoint: string;
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

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface HtmlToPdfExporter {
  tmpDirectory: string
  conversionScriptPath: string
}

export interface RateLimit {
  windowInSeconds: number;
  maxRequestsPerWindow: number;
}

export interface AppSettings {
  expressServer: ExpressServerConfig;
  hocuspocusServer: HocuspocusServerConfig;
  rateLimit: RateLimit;
  bbbWeb: BbbWebConfig;
  htmlToPdfExporter: HtmlToPdfExporter;
  log: LogConfig;
  redis: RedisConfig;
  postgres: PostgresConfig;
}
