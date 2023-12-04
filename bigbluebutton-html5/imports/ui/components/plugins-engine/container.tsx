import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import logger from '/imports/startup/client/logger';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import * as uuidLib from 'uuid';
import PluginHooksHandlerContainer from './plugin-hooks-handler/container';
import PluginsEngineComponent from './component';
import { PluginConfig, EffectivePluginConfig } from './types';
import PluginLoaderContainer from './plugin-loader/container';
import PluginProvidedStateContainer from './plugin-provided-state/container';
import PluginDataChannelManagerContainer from './plugin-data-channel/container';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

const PluginsEngineContainer = () => {
  const [MeetingSettings] = useMeetingSettings();
  const pluginsConfig: PluginConfig[] | undefined = MeetingSettings.public.plugins;
  // If there is no plugin to load, the engine simply returns null
  if (!pluginsConfig) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const loadedPlugins = useRef<number>(0);

  const effectivePluginsConfig: EffectivePluginConfig[] = useMemo<EffectivePluginConfig[]>(
    () => pluginsConfig.map((p: PluginConfig) => ({
      ...p,
      uuid: uuidLib.v4(),
    } as EffectivePluginConfig)), [
      pluginsConfig,
    ],
  );

  const totalNumberOfPlugins = pluginsConfig?.length;
  window.React = React;

  useEffect(() => {
    logger.info(`${loadedPlugins.current}/${totalNumberOfPlugins} plugins loaded`);
  },
  [loadedPlugins.current, lastLoadedPlugin]);

  return (
    <>
      <PluginsEngineComponent
        {...{
          containerRef,
        }}
      />
      {
        effectivePluginsConfig.map((effectivePluginConfig: EffectivePluginConfig) => {
          const { uuid, name: pluginName } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = PluginSdk.getPluginApi(uuid, pluginName);
          return (
            <div key={uuid}>
              <PluginLoaderContainer
                {...{
                  uuid,
                  containerRef,
                  loadedPlugins,
                  setLastLoadedPlugin,
                  pluginConfig: effectivePluginConfig,
                }}
              />
              <PluginDataChannelManagerContainer
                {...{
                  pluginApi,
                }}
              />
              <PluginProvidedStateContainer
                {...{
                  pluginApi,
                  uuid,
                }}
              />
            </div>
          );
        })
      }
      <PluginHooksHandlerContainer />
    </>
  );
};

export default PluginsEngineContainer;
