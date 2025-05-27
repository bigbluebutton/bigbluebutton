import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { PluginConfig } from '../types';

export interface PluginLoaderManagerProps {
  pluginApi: PluginApi;
  uuid: string;
  containerRef: React.RefObject<HTMLDivElement>;
  setNumberOfLoadedPlugins: React.Dispatch<React.SetStateAction<number>>;
  setLastLoadedPlugin: React.Dispatch<React.SetStateAction<HTMLScriptElement | undefined>>;
  pluginConfig: PluginConfig;
}
