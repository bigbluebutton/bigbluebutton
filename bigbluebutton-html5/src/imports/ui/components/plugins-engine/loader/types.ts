import { PluginConfig } from '../types';

export interface PluginLoaderManagerProps {
  uuid: string;
  containerRef: React.RefObject<HTMLDivElement>;
  loadedPlugins: React.MutableRefObject<number>;
  setLastLoadedPlugin: React.Dispatch<React.SetStateAction<HTMLScriptElement | undefined>>;
  pluginConfig: PluginConfig;
}
