import React, { useEffect, useRef, useState } from 'react';
import logger from '/imports/startup/client/logger';
import { uniqueId } from '/imports/utils/string-utils';

const PLUGINS = Meteor.settings.public.plugins;

export default (props) => {
  const { onReady } = props;
  const containerRef = useRef();
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState(null);
  const loadedPlugins = useRef();
  if (!loadedPlugins.current) {
    loadedPlugins.current = 0;
  }

  const totalNumberOfPlugins = PLUGINS?.length;
  window.React = React;
  useEffect(() => {
    window.bbb_plugins = {};

    if (!containerRef.current || !PLUGINS) {
      return;
    }

    PLUGINS.forEach((plugin) => {
      const div = document.createElement('div');
      div.id = uniqueId('plugin-');
      containerRef.current.appendChild(div);

      const script = document.createElement('script');
      script.onload = () => {
        loadedPlugins.current += 1;
        setLastLoadedPlugin(script);
        logger.info(`Loaded plugin ${plugin.name}`);
      };
      script.onerror = (err) => {
        logger.info(`Error when loading plugin ${plugin.name}, error: ${err}`);
      };
      script.src = plugin.url;
      script.setAttribute('elementId', div.id);
      script.setAttribute('pluginName', plugin.name);
      document.head.appendChild(script);
    });
  }, [PLUGINS, containerRef]);

  useEffect(() => {
    if (loadedPlugins.current === totalNumberOfPlugins) {
      if (onReady) onReady();
    }
    logger.info(`${loadedPlugins.current}/${totalNumberOfPlugins} plugins loaded`);
  },
  [loadedPlugins.current, lastLoadedPlugin]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
      }}
    />
  );
};
