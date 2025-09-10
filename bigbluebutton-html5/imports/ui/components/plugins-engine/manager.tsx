import React, {
  useEffect, useRef, useState,
} from 'react';
import logger from '/imports/startup/client/logger';
import {
  BbbPluginSdk,
} from 'bigbluebutton-html-plugin-sdk';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import * as uuidLib from 'uuid';
import { isEqual } from 'radash';
import PluginDataConsumptionManager from './data-consumption/manager';
import PluginDataCreationManager from './data-creation/manager';
import PluginsEngineComponent from './component';
import { EffectivePluginConfig, PluginConfigFromGraphql, PluginsEngineManagerProps } from './types';
import PluginLoaderManager from './loader/manager';
import ExtensibleAreaStateManager from './extensible-areas/manager';
import PluginDataChannelManager from './data-channel/manager';
import PluginUiCommandsHandler from './ui-commands/handler';
import PluginDomElementManipulationManager from './dom-element-manipulation/manager';
import PluginServerCommandsHandler from './server-commands/handler';
import PluginLearningAnalyticsDashboardManager from './learning-analytics-dashboard/manager';
import PluginEventPersistenceManager from './event-persistence/manager';

const PluginsEngineManager = (props: PluginsEngineManagerProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project

  const { pluginConfig } = props;
  // If there is no plugin to load, the engine simply returns null

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const [effectivePluginsConfig, setEffectivePluginsConfig] = useState<EffectivePluginConfig[] | undefined>();
  const [failedPlugins, setFailedPlugins] = useState<PluginConfigFromGraphql[]>([]);
  const [numberOfLoadedPlugins, setNumberOfLoadedPlugins] = useState<number>(0);

  useEffect(() => {
    const graphqlFailedPlugins = pluginConfig?.filter(
      (p) => p.loadFailureReason !== '',
    );
    setEffectivePluginsConfig(
      pluginConfig?.filter(
        (p) => p.loadFailureReason === '',
      ).map((p) => ({
        ...p,
        name: p.name,
        url: p.javascriptEntrypointUrl,
        localesBaseUrl: p.localesBaseUrl,
        uuid: uuidLib.v4(),
      } as EffectivePluginConfig)),
    );
    if (!isEqual(graphqlFailedPlugins, failedPlugins)) {
      setFailedPlugins(graphqlFailedPlugins || []);
    }
  }, [
    pluginConfig,
  ]);

  const totalNumberOfPlugins = pluginConfig?.length;
  window.React = React;

  useEffect(() => {
    if (totalNumberOfPlugins) {
      logger.info({
        logCode: 'plugin_loading_status',
        extraInfo: {
          numberOfLoadedPlugins,
          totalNumberOfPlugins,
        },
      }, `${numberOfLoadedPlugins}/${totalNumberOfPlugins} plugins loaded`);
    }
  },
  [numberOfLoadedPlugins, lastLoadedPlugin]);

  useEffect(() => {
    if (failedPlugins && failedPlugins.length > 0) {
      failedPlugins.forEach((p) => {
        logger.debug({
          logCode: 'plugin_loading_failure',
          extraInfo: {
            pluginName: p.name,
            failureReason: p.loadFailureReason,
            failureSource: p.loadFailureSource,
          },
        }, `Plugin [${p.name}] failed in back-end, error: `, p.loadFailureReason);
      });
    }
  },
  [failedPlugins]);

  return (
    <>
      <PluginsEngineComponent
        {...{
          containerRef,
        }}
      />
      <PluginDataCreationManager />
      <PluginDataConsumptionManager />
      <PluginServerCommandsHandler />
      <PluginUiCommandsHandler />
      <PluginDomElementManipulationManager />
      {
        effectivePluginsConfig?.map((effectivePluginConfig: EffectivePluginConfig) => {
          const { uuid, name: pluginName, localesBaseUrl } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = BbbPluginSdk.getPluginApi(uuid, pluginName, localesBaseUrl);
          return (
            <div key={uuid}>
              <PluginLoaderManager
                {...{
                  uuid,
                  containerRef,
                  setNumberOfLoadedPlugins,
                  setLastLoadedPlugin,
                  pluginConfig: effectivePluginConfig,
                }}
              />
              <PluginLearningAnalyticsDashboardManager
                pluginName={pluginName}
              />
              <PluginEventPersistenceManager
                pluginName={pluginName}
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
