import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { LoggerSettings, PluginConfig } from '../types';

export interface PluginLoaderManagerProps {
  uuid: string;
  containerRef: React.RefObject<HTMLDivElement>;
  setNumberOfLoadedPlugins: React.Dispatch<React.SetStateAction<number>>;
  setLastLoadedPlugin: React.Dispatch<React.SetStateAction<HTMLScriptElement | undefined>>;
  pluginConfig: PluginConfig;
  pluginApi: PluginApi;
  loggerSettings: LoggerSettings;
}
