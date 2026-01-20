export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

export interface ViewerUser {
  userId: string;
  name: string;
  extId: string | null;
  role: string;
  disconnected: boolean;
  sessionToken: string;
}

export interface MeetingLockSettings {
  meetingId: string;
  disableNotes: boolean;
}