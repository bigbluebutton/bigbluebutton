// If the environment variable is undefined, fallback to the default value
export const REDIS_HOST = process.env.BBB_REDIS_HOST || '127.0.0.1';
export const REDIS_PORT = Number(process.env.BBB_REDIS_PORT) || 6379;
export const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1';
export const SERVER_PORT = Number(process.env.SERVER_PORT) || 8093;
export const MAX_BODY_SIZE = Number(process.env.MAX_BODY_SIZE) || 10485760; // 10MB
export const DEBUG = false;
