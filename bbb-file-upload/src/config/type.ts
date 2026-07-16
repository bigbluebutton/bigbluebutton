export interface ExpressServerConfig {
  host: string;
  port: number;
}

export interface StorageConfig {
  basePath: string;
  uploadsDirName: string;
}

export interface LimitsConfig {
  maxFileSizeKb: number;
  maxImageDimensionPx: number;
  allowedMimeTypes: string[];
  quotaPerMeetingMb: number;
}

export interface RateLimitConfig {
  windowInSeconds: number;
  maxRequestsPerWindow: number;
}

export interface CleanupConfig {
  retentionMinutes: number;
  recordingHoldMarker: string;
  recordingHoldMaxHours: number;
}

export interface LogConfig {
  level: string;
}

export interface RedisChannelsConfig {
  subscribe: string[];
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string | null;
  channels: RedisChannelsConfig;
}

export interface AppSettings {
  expressServer: ExpressServerConfig;
  storage: StorageConfig;
  limits: LimitsConfig;
  rateLimit: RateLimitConfig;
  cleanup: CleanupConfig;
  log: LogConfig;
  redis: RedisConfig;
}
