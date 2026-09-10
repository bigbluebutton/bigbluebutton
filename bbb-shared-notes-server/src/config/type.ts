export interface HocuspocusServerConfig {
  host: string;
  port: number;
}

export interface ExpressServerConfig {
  host: string;
  port: number;
  maxContentLength: number; // In kB
  maxConnectionsPerSessionToken: number;
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
  documentExpireMinutesAfterMeetingEnd: number;
}

export interface CommandExecution {
  workDir: string
  runnerScript: string
  timeout: number;
}

export interface RateLimit {
  windowInSeconds: number;
  maxRequestsPerWindow: number;
}

export interface FileUploadConfig {
  // Base directory where bbb-file-upload stores per-meeting uploads. Layout:
  // {basePath}/{meetingId}/{uploadsDirName}/{uuid}.{ext}
  basePath: string;
  uploadsDirName: string;
}

export interface AppSettings {
  expressServer: ExpressServerConfig;
  hocuspocusServer: HocuspocusServerConfig;
  rateLimit: RateLimit;
  bbbWeb: BbbWebConfig;
  commandExecution: CommandExecution;
  log: LogConfig;
  redis: RedisConfig;
  postgres: PostgresConfig;
  fileUpload: FileUploadConfig;
}
