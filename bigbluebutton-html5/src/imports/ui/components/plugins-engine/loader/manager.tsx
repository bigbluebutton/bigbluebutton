import { PluginLoaderManagerProps } from './types';
import { useEffect } from 'react';
import logger from '/imports/startup/client/logger';

const PluginLoaderManager = (props: PluginLoaderManagerProps) => {
  const {
    uuid,
    containerRef,
    loadedPlugins,
    setLastLoadedPlugin,
    pluginConfig: plugin,
  } = props;

  useEffect(() => {
    if (!plugin || !containerRef) {
      return;
    }

    const div = document.createElement('div');
    div.id = uuid;
    containerRef.current?.appendChild(div);

    const script = document.createElement('script');
    script.onload = () => {
      loadedPlugins.current += 1;
      setLastLoadedPlugin(script);
      logger.info(`Loaded plugin ${plugin.name}`);
    };
    script.onerror = (err) => {
      logger.error(`Error when loading plugin ${plugin.name}, error: `, err);
    };
    script.src = plugin.url;
    script.setAttribute('uuid', div.id);
    script.setAttribute('pluginName', plugin.name);
    document.head.appendChild(script);
  }, [plugin, containerRef]);
  return null;
};

export default PluginLoaderManager;
