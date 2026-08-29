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

function loadConfig(): AppSettings {
  const defaultPath = existsSync(PRODUCTION_DEFAULT_PATH) ? PRODUCTION_DEFAULT_PATH : DEV_DEFAULT_PATH;
  const config = load(readFileSync(defaultPath, 'utf8')) as AppSettings;

  if (existsSync(OVERRIDE_PATH)) {
    const override = load(readFileSync(OVERRIDE_PATH, 'utf8')) as Partial<AppSettings>;
    return deepMerge(config, override);
  }

  return config;
}

export default loadConfig();
