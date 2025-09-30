export type PluginSettingsMap = Record<string, boolean>;

interface PluginSettings {
  isNew?: boolean;
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
