import React, {
  useEffect, useRef, useState, useMemo,
} from 'react';
import logger from '/imports/startup/client/logger';
import {
  BbbPluginSdk,
} from 'bigbluebutton-html-plugin-sdk';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import * as uuidLib from 'uuid';
import PluginHooksHandlerContainer from './data-consumption/state-manager/manager';
import PluginsEngineComponent from './component';
import { PluginConfig, EffectivePluginConfig } from './types';
import PluginLoaderContainer from './loader/manager';
import ExtensibleAreaStateManager from './extensible-areas/state-manager/manager';
import PluginDataChannelManagerContainer from './data-channel/manager';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - temporary, while meteor exists in the project
const PLUGINS_CONFIG = Meteor.settings.public.plugins;

const PluginsEngineContainer = () => {
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
      {
        effectivePluginsConfig.map((effectivePluginConfig: EffectivePluginConfig) => {
          const { uuid, name: pluginName } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = BbbPluginSdk.getPluginApi(uuid, pluginName);
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
      <PluginHooksHandlerContainer />
    </>
  );
};

export default PluginsEngineContainer;
