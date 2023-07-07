import React, { useEffect, useRef, useState, useMemo } from 'react';
import logger from '/imports/startup/client/logger';

import PluginHooksHandlerContainer from './plugin-hooks-handler/container';
import PluginsEngineComponent from './component';
import { PluginConfigSetting, PluginEngineProps, UniquePluginConfigSetting } from './types';
import PluginsLoaderComponent from './plugin-loader/component';
import PluginProvidedStateComponent from './plugin-provided-state/component';

const PLUGINS = Meteor.settings.public.plugins;

const createUuid = () => {
  const UUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === "x" ? r : (r % 4) + 8;
      return v.toString(16);
  });
  return UUID;
}

const PluginEngineContainer = (props: PluginEngineProps) => {
  const { onReady } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const loadedPlugins = useRef<number>(0);

  const pluginsFromConfigMapped: UniquePluginConfigSetting[] = useMemo<UniquePluginConfigSetting[]>(() => PLUGINS.map((p: PluginConfigSetting) => {
    return {
      ...p,
      uuid: createUuid(),
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
