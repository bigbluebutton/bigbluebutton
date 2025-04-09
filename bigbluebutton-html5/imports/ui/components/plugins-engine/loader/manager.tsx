import { useEffect } from 'react';
import logger from '/imports/startup/client/logger';
import { PluginBrowserWindow } from 'bigbluebutton-html-plugin-sdk';
import { PluginLoaderManagerProps } from './types';
import { pluginName } from 'mini-css-extract-plugin';

declare const window: PluginBrowserWindow;

const PluginLoaderManager = (props: PluginLoaderManagerProps) => {
  const {
    pluginApi,
    uuid,
    containerRef,
    setNumberOfLoadedPlugins,
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

    const script: HTMLScriptElement = document.createElement('script');
    script.onload = () => {
      setNumberOfLoadedPlugins((current) => current + 1);
      setLastLoadedPlugin(script);
      logger.info({
        logCode: 'plugin_loaded',
      }, `Loaded plugin ${plugin.name}`);
      // Send pluginApi to plugin constructor
      window.bbbPluginApiConstructors[uuid](pluginApi);
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

    if (!window.bbbPluginApiConstructors[uuid]) {
      document.head.appendChild(script);
    } else {
      logger.error({
        logCode: 'plugin_load_error',
        extraInfo: {
          pluginName: plugin.name,
          pluginUrl: plugin.url,
        },
      }, `Constructor for plugin ${plugin.name} already set. Not loading...`);
    }
  }, [plugin, containerRef]);
  return null;
};

export default PluginLoaderManager;
