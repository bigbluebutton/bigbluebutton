import { useEffect, useState } from 'react';
import { PluginLoaderManagerProps } from './types';
import logger from '/imports/startup/client/logger';
import { setLogger } from '../utils';

const PluginLoaderManager = (props: PluginLoaderManagerProps) => {
  const {
    uuid,
    containerRef,
    onPluginLoadSettled,
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
    const loadStartedAt = performance.now();
    script.onload = () => {
      logger.info({
        logCode: 'plugin_loaded',
        extraInfo: {
          pluginName: plugin.name,
          loadTimeMs: Math.round(performance.now() - loadStartedAt),
        },
      }, `Loaded plugin ${plugin.name}`);
      onPluginLoadSettled(uuid, true);
    };
    script.onerror = () => {
      logger.error({
        logCode: 'plugin_load_error',
        extraInfo: {
          pluginName: plugin.name,
          pluginUrl: plugin.url,
          loadTimeMs: Math.round(performance.now() - loadStartedAt),
        },
      }, `Error when loading plugin ${plugin.name}`);
      onPluginLoadSettled(uuid, false);
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
