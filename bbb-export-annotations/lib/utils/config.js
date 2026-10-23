import fs from 'fs';

const DEFAULT_PATH = './config/settings.json';
const OVERRIDE_PATH = '/etc/bigbluebutton/bbb-export-annotations.json';

const isObject = (v) => v !== null && typeof v === 'object' &&
    !Array.isArray(v);

/**
 * Merges objects key by key; arrays and other values are replaced.
 * @param {Object} base - The default settings.
 * @param {Object} override - The settings that take precedence.
 * @return {Object} The merged settings.
 */
function deepMerge(base, override) {
  const result = {...base};
  for (const [key, value] of Object.entries(override)) {
    result[key] = isObject(value) && isObject(base[key]) ?
        deepMerge(base[key], value) : value;
  }
  return result;
}

const config = JSON.parse(fs.readFileSync(DEFAULT_PATH, 'utf8'));
const override = fs.existsSync(OVERRIDE_PATH) ?
    JSON.parse(fs.readFileSync(OVERRIDE_PATH, 'utf8')) : {};

export default deepMerge(config, override);
