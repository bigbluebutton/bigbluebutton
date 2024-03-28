import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import logger from '/imports/startup/client/logger';
import {
  BbbPluginSdk,
} from 'bigbluebutton-html-plugin-sdk';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import * as uuidLib from 'uuid';
import PluginDataConsumptionManager from './data-consumption/manager';
import PluginsEngineComponent from './component';
import { PluginConfig, EffectivePluginConfig } from './types';
import PluginLoaderManager from './loader/manager';
import ExtensibleAreaStateManager from './extensible-areas/manager';
import PluginDataChannelManager from './data-channel/manager';
import PluginUiCommandsHandler from './ui-commands/handler';
import PluginDomElementManipulationManager from './dom-element-manipulation/manager';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - temporary, while meteor exists in the project
const PLUGINS_CONFIG = window.meetingClientSettings.public.plugins;

const PluginsEngineManager = () => {
  // If there is no plugin to load, the engine simply returns null
  if (!PLUGINS_CONFIG) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const loadedPlugins = useRef<number>(0);

  const effectivePluginsConfig: EffectivePluginConfig[] = useMemo<EffectivePluginConfig[]>(
    () => PLUGINS_CONFIG.map((p: PluginConfig) => ({
      ...p,
      uuid: uuidLib.v4(),
    } as EffectivePluginConfig)), [
      PLUGINS_CONFIG,
    ],
  );

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
          containerRef,
        }}
      />
      <PluginDataConsumptionManager />
      <PluginUiCommandsHandler />
      <PluginDomElementManipulationManager />
      {
        effectivePluginsConfig.map((effectivePluginConfig: EffectivePluginConfig) => {
          const { uuid, name: pluginName } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = BbbPluginSdk.getPluginApi(uuid, pluginName);
          return (
            <div key={uuid}>
              <PluginLoaderManager
                {...{
                  uuid,
                  containerRef,
                  loadedPlugins,
                  setLastLoadedPlugin,
                  pluginConfig: effectivePluginConfig,
                }}
              />
              <PluginDataChannelManager
                {...{
                  pluginApi,
                }}
              />
              <ExtensibleAreaStateManager
                {...{
                  pluginApi,
                  uuid,
                }}
              />
            </div>
          );
        })
      }
    </>
  );
};

export default PluginsEngineManager;
