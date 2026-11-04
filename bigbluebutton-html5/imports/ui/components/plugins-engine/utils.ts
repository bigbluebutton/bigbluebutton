import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';
import { LoggerSettings, PluginsLoadingProgress } from './types';
import { ClientLog } from '../../Types/meetingClientSettings';

function setLogger(pluginApi: PluginApi, loggerSettings: LoggerSettings) {
  const overridePluginApi = pluginApi;
  const { pluginName } = pluginApi;
  if (!overridePluginApi.logger) overridePluginApi.logger = logger.getPluginLogger(pluginName || '', loggerSettings);
}

function mergeSection<T extends object>(base: T, override?: Partial<T>) {
  if (!override) return base;
  const copy = { ...base };
  (Object.keys(override) as (keyof T)[]).forEach((key) => {
    const value = override[key];
    if (value !== undefined) copy[key] = value;
  });
  return copy;
}

function overridePluginSettingsToDefault(
  overrideSettings: LoggerSettings,
  defaultSettings: ClientLog,
): ClientLog {
  return {
    console: mergeSection(defaultSettings.console, overrideSettings.console),
    external: mergeSection(defaultSettings.external, overrideSettings.external),
  };
}

function logPluginsLoadingSummary(progress: PluginsLoadingProgress) {
  const { loadedPluginNames, failedPluginNames, totalNumberOfPlugins } = progress;
  logger.info({
    logCode: 'plugin_loading_status',
    extraInfo: {
      numberOfLoadedPlugins: loadedPluginNames.length,
      totalNumberOfPlugins,
      failedPluginNames,
      loadTimeMs: Math.round(performance.now() - progress.startedAt),
    },
  }, `${loadedPluginNames.length}/${totalNumberOfPlugins} plugins loaded`);
}

export { setLogger, overridePluginSettingsToDefault, logPluginsLoadingSummary };
