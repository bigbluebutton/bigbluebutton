import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { LoggerSettings, PluginConfig } from '../types';

export interface PluginLoaderManagerProps {
  uuid: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onPluginLoadSettled: (uuid: string, loaded: boolean) => void;
  pluginConfig: PluginConfig;
  pluginApi: PluginApi;
  loggerSettings: LoggerSettings;
}
