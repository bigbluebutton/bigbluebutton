import Local from '/imports/ui/services/storage/local';

export type PluginSettingsMap = Record<string, boolean>;

interface PluginSettings {
  isNew?: boolean;
  pin?: boolean | string[];
  [key: string]: unknown;
}

interface PluginConfig {
  name: string;
  settings?: PluginSettings;
}

type PublicSettingsWithPlugins = {
  plugins?: PluginConfig[];
};

/**
 * Utility function that returns the plugins array from the settings.
 */
const getPluginsFromSettings = (): PluginConfig[] => {
  const publicSettings = window.meetingClientSettings?.public as PublicSettingsWithPlugins;
  return publicSettings?.plugins || [];
};

/**
 * Checks if a plugin is marked as "isNew" in the settings.
 * @param {string} pluginName The name of the plugin to check.
 * @returns {boolean} True if it is new, false otherwise.
 */
export const isPluginNew = (pluginName?: string): boolean => {
  if (!pluginName) return false;

  const plugins = getPluginsFromSettings();

  const found = plugins.find((p) => p.name === pluginName);

  const result = found?.settings?.isNew === true;

  return result;
};

const PLUGIN_UNPINNED_APPS_STORAGE_KEY = 'pluginAppsUserUnpinned';
// eslint-disable-next-line no-underscore-dangle
let _cachedPluginUnpinnedApps: string[] | undefined;

export const getPluginUnpinnedApps = (): string[] => {
  if (_cachedPluginUnpinnedApps !== undefined) return _cachedPluginUnpinnedApps;
  const stored = Local.getItem(PLUGIN_UNPINNED_APPS_STORAGE_KEY);
  _cachedPluginUnpinnedApps = Array.isArray(stored) ? stored : [];
  return _cachedPluginUnpinnedApps;
};

export const addPluginUnpinnedApp = (key: string): void => {
  const current = getPluginUnpinnedApps();
  if (!current.includes(key)) {
    _cachedPluginUnpinnedApps = [...current, key];
    Local.setItem(PLUGIN_UNPINNED_APPS_STORAGE_KEY, _cachedPluginUnpinnedApps);
  }
};

export const removePluginUnpinnedApp = (key: string): void => {
  const current = getPluginUnpinnedApps();
  if (current.includes(key)) {
    _cachedPluginUnpinnedApps = current.filter((k) => k !== key);
    Local.setItem(PLUGIN_UNPINNED_APPS_STORAGE_KEY, _cachedPluginUnpinnedApps);
  }
};

/**
 * Checks if a plugin should have its gallery apps items pinned by default,
 * based on a specific setting(pin) in the plugin config.
 * @param {string} pluginName The name of the plugin to check.
 * @returns {boolean | string[]} True if all entries should be pinned, false if none should be pinned,
 *  or an array of ids of apps gallery items to be pinned.
 */
export const shouldPinPluginAppsInGallery = (pluginName?: string): boolean | string[] => {
  if (!pluginName) return false;

  const plugins = getPluginsFromSettings();

  const found = plugins.find((p) => p.name === pluginName);

  const pinSetting = found?.settings?.pin;

  if (pinSetting === true) {
    return true;
  }

  if (Array.isArray(pinSetting)) {
    return pinSetting;
  }

  return false;
};
