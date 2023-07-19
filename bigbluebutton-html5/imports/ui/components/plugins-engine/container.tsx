import React, { useEffect, useRef, useState, useMemo } from 'react';
import logger from '/imports/startup/client/logger';

import PluginHooksHandlerContainer from './plugin-hooks-handler/container';
import PluginsEngineComponent from './component';
import { PluginConfigSetting, PluginEngineProps, UniquePluginConfigSetting } from './types';
import PluginsLoaderComponent from './plugin-loader/component';
import PluginProvidedStateComponent from './plugin-provided-state/component';
import * as uuid from 'uuid';

const PLUGINS = Meteor.settings.public.plugins;

const PluginEngineContainer = (props: PluginEngineProps) => {
  // If there is no plugin to load, the engine simply returns null
  if (!PLUGINS) return null;

  const { onReady } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const loadedPlugins = useRef<number>(0);

  const pluginsFromConfigMapped: UniquePluginConfigSetting[] = useMemo<UniquePluginConfigSetting[]>(() => PLUGINS.map((p: PluginConfigSetting) => {
    return {
      ...p,
      uuid: uuid.v4(),
    } as UniquePluginConfigSetting
  }), [ PLUGINS ]);


  const totalNumberOfPlugins = PLUGINS?.length;
  window.React = React;

  useEffect(() => {
    if (loadedPlugins.current === totalNumberOfPlugins) {
      if (onReady) onReady();
    }
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
        pluginsFromConfigMapped.map((plugin: UniquePluginConfigSetting) => {
          const uuid = plugin.uuid;
          return (
            <div key={uuid}>
              <PluginsLoaderComponent 
                {...{
                  uuid,
                  containerRef, 
                  loadedPlugins, 
                  setLastLoadedPlugin,
                  pluginConfigSettings: plugin
                }}
              />
              <PluginProvidedStateComponent 
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

export default PluginEngineContainer;
