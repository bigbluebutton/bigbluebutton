import { readFileSync, existsSync } from 'fs';
import { load } from 'js-yaml';
import { AppSettings } from './type';

const PRODUCTION_DEFAULT_PATH = '/usr/share/bbb-shared-notes-server/config/default.yml';
const DEV_DEFAULT_PATH = './config/default.yml';
const OVERRIDE_PATH = '/etc/bigbluebutton/bbb-shared-notes-server.yml';

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as Array<keyof T>) {
    const overrideVal = override[key];
    const baseVal = base[key];
    if (
      overrideVal !== null &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal) &&
      baseVal !== null &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal as object, overrideVal as object) as T[typeof key];
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[typeof key];
    }
  }
  return result;
}

export interface ConfigPaths {
  defaultPath: string;
  overridePath: string;
}

const installedPaths = (): ConfigPaths => ({
  defaultPath: existsSync(PRODUCTION_DEFAULT_PATH) ? PRODUCTION_DEFAULT_PATH : DEV_DEFAULT_PATH,
  overridePath: OVERRIDE_PATH,
});

// The default file, then the override file, then the environment
export function loadConfig(paths: ConfigPaths = installedPaths(), env: NodeJS.ProcessEnv = process.env): AppSettings {
  let config = load(readFileSync(paths.defaultPath, 'utf8')) as AppSettings;

  if (existsSync(paths.overridePath)) {
    // an empty file is null for js-yaml
    const override = (load(readFileSync(paths.overridePath, 'utf8')) ?? {}) as Partial<AppSettings>;
    config = deepMerge(config, override);
  }

  // These variables, if set, win over the default and the override file
  if (env.SERVER_HOST) config.expressServer.host = env.SERVER_HOST;
  if (env.BBB_WEB_URL) {
    // bbb-web's base URL, as for bbb-export-annotations, e.g. http://web:8090
    const url = URL.canParse(env.BBB_WEB_URL) ? new URL(env.BBB_WEB_URL) : undefined;
    if (url?.protocol !== 'http:' || !url.hostname) {
      throw new Error(`BBB_WEB_URL=${env.BBB_WEB_URL} is not bbb-web's base URL: use http://host[:port], e.g. http://web:8090`);
    }
    if (url.pathname !== '/') {
      console.warn(`BBB_WEB_URL=${env.BBB_WEB_URL}: only http://host[:port] is used`);
    }
    config.bbbWeb.host = url.hostname;
    config.bbbWeb.port = url.port || '80';
  }
  if (env.REDIS_HOST) config.redis.host = env.REDIS_HOST;
  if (env.REDIS_PASSWORD) config.redis.password = env.REDIS_PASSWORD;
  if (env.REDIS_PORT) {
    // Kubernetes sets REDIS_PORT=tcp://<address>:6379 for a Service named redis
    if (/^\d+$/.test(env.REDIS_PORT)) config.redis.port = Number(env.REDIS_PORT);
    else console.warn(`REDIS_PORT=${env.REDIS_PORT} is not a port number, using ${config.redis.port}`);
  }
  if (env.POSTGRES_HOST) config.postgres.host = env.POSTGRES_HOST;
  if (env.POSTGRES_PASSWORD) config.postgres.password = env.POSTGRES_PASSWORD;

  return config;
}

export default loadConfig();
