import { useEffect, useState } from 'react';
import { PluginLoaderManagerProps } from './types';
import logger from '/imports/startup/client/logger';
import { setLogger } from '../utils';

const PluginLoaderManager = (props: PluginLoaderManagerProps) => {
  const {
    uuid,
    containerRef,
    setNumberOfLoadedPlugins,
    setLastLoadedPlugin,
    pluginApi,
    loggerSettings,
    pluginConfig: plugin,
  } = props;

  const [isLoggerLoaded, setIsLoggerLoaded] = useState(false);

  useEffect(() => {
    setLogger(pluginApi, loggerSettings);
    setIsLoggerLoaded(true);
  }, []);

  useEffect(() => {
    if (!plugin || !containerRef || !isLoggerLoaded) {
      return;
    }

    const div = document.createElement('div');
    div.id = uuid;
    containerRef.current?.appendChild(div);

    const script: HTMLScriptElement = document.createElement('script');
    script.onload = () => {
      setNumberOfLoadedPlugins((current) => current + 1);
      setLastLoadedPlugin(script);
      logger.info({
        logCode: 'plugin_loaded',
      }, `Loaded plugin ${plugin.name}`);
    };
    script.onerror = () => {
      logger.error({
        logCode: 'plugin_load_error',
        extraInfo: {
          pluginName: plugin.name,
          pluginUrl: plugin.url,
        },
      }, `Error when loading plugin ${plugin.name}`);
    };
    script.src = plugin.url;
    script.setAttribute('uuid', div.id);
    script.setAttribute('pluginName', plugin.name);
    if (plugin.javascriptEntrypointIntegrity) {
      script.setAttribute('integrity', plugin.javascriptEntrypointIntegrity);
    }
    document.head.appendChild(script);
  }, [plugin, containerRef, isLoggerLoaded]);
  return null;
};

export default PluginLoaderManager;
