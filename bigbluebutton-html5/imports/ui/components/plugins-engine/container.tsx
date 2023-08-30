import React, { useEffect, useRef, useState, useMemo } from 'react';
import logger from '/imports/startup/client/logger';

import PluginHooksHandlerContainer from './plugin-hooks-handler/container';
import PluginsEngineComponent from './component';
import { PluginConfig, PluginsEngineContainerProps, EffectivePluginConfig } from './types';
import PluginLoaderContainer from './plugin-loader/container';
import PluginProvidedStateContainer from './plugin-provided-state/container';
import * as uuid from 'uuid';

const PLUGINS_CONFIG = Meteor.settings.public.plugins;

const PluginsEngineContainer = () => {
  // If there is no plugin to load, the engine simply returns null
  if (!PLUGINS_CONFIG) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const loadedPlugins = useRef<number>(0);

  const effectivePluginsConfig: EffectivePluginConfig[] = useMemo<EffectivePluginConfig[]>(
    () => PLUGINS_CONFIG.map((p: PluginConfig) => {
    return {
      ...p,
      uuid: uuid.v4(),
    } as EffectivePluginConfig
  }), [
    PLUGINS_CONFIG,
  ]);

  const totalNumberOfPlugins = PLUGINS_CONFIG?.length;
  window.React = React;

  useEffect(() => {
    logger.info(`${loadedPlugins.current}/${totalNumberOfPlugins} plugins loaded`);
  },
  [loadedPlugins.current, lastLoadedPlugin]);

  return (
    <>
      <PluginsEngineComponent 
        {...{
          containerRef
        }}
      />
      {
        effectivePluginsConfig.map((effectivePluginConfig: EffectivePluginConfig) => {
          const uuid = effectivePluginConfig.uuid;
          return (
            <div key={uuid}>
              <PluginLoaderContainer 
                {...{
                  uuid,
                  containerRef, 
                  loadedPlugins, 
                  setLastLoadedPlugin,
                  pluginConfig: effectivePluginConfig
                }}
              />
              <PluginProvidedStateContainer 
                {...{
                  uuid,
                }}
              />
            </div>
          )
        })
      }
      <PluginHooksHandlerContainer />
    </>
  );
};

export default PluginsEngineContainer;
