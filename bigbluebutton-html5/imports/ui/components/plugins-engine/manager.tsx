import React, {
  useCallback, useEffect, useRef, useState,
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
import {
  EffectivePluginConfig, PluginConfigFromGraphql, PluginsEngineManagerProps, PluginsLoadingProgress,
} from './types';
import { logPluginsLoadingSummary } from './utils';
import PluginLoaderManager from './loader/manager';
import ExtensibleAreaStateManager from './extensible-areas/manager';
import PluginDataChannelManager from './data-channel/manager';
import PluginUiCommandsHandler from './ui-commands/handler';
import PluginDomElementManipulationManager from './dom-element-manipulation/manager';
import PluginServerCommandsHandler from './server-commands/handler';
import PluginLearningAnalyticsDashboardManager from './learning-analytics-dashboard/manager';
import PluginEventPersistenceManager from './event-persistence/manager';
import { DataChannelEntry } from './data-channel/types';
import createUseSubscription from '../../core/hooks/createUseSubscription';
import { PLUGIN_DATA_CHANNEL_PUBLIC_SUBSCRIPTION, PLUGIN_DATA_CHANNEL_PRIVATE_SUBSCRIPTION } from './data-channel/subscriptions';
import { mergeDataChannelEntries } from './data-channel/utils';

const PluginsEngineManager = (props: PluginsEngineManagerProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project

  const { pluginConfig } = props;
  // If there is no plugin to load, the engine simply returns null

  const containerRef = useRef<HTMLDivElement>(null);
  const [effectivePluginsConfig, setEffectivePluginsConfig] = useState<EffectivePluginConfig[] | undefined>();
  const [failedPlugins, setFailedPlugins] = useState<PluginConfigFromGraphql[]>([]);
  // A ref rather than state: scripts settle in bursts that React batches into one
  // render, so a count logged per render skips values.
  const loadingProgressRef = useRef<PluginsLoadingProgress>();

  useEffect(() => {
    const graphqlFailedPlugins = pluginConfig?.filter(
      (p) => p.loadFailureReason !== '',
    );
    const newEffectivePluginsConfig = pluginConfig?.filter(
      (p) => p.loadFailureReason === '',
    ).map((p) => ({
      ...p,
      name: p.name,
      loggerSettings: p.loggerSettings,
      url: p.javascriptEntrypointUrl,
      uuid: uuidLib.v4(),
    } as EffectivePluginConfig));
    setEffectivePluginsConfig(newEffectivePluginsConfig);
    if (!isEqual(graphqlFailedPlugins, failedPlugins)) {
      setFailedPlugins(graphqlFailedPlugins || []);
    }

    const totalNumberOfPlugins = pluginConfig?.length ?? 0;
    loadingProgressRef.current = {
      startedAt: performance.now(),
      totalNumberOfPlugins,
      pendingPluginNamesByUuid: new Map(newEffectivePluginsConfig?.map((p) => [p.uuid, p.name])),
      loadedPluginNames: [],
      failedPluginNames: graphqlFailedPlugins?.map((p) => p.name) ?? [],
    };
    if (totalNumberOfPlugins > 0 && !newEffectivePluginsConfig?.length) {
      logPluginsLoadingSummary(loadingProgressRef.current);
    }
  }, [
    pluginConfig,
  ]);

  window.React = React;

  const handlePluginLoadSettled = useCallback((uuid: string, loaded: boolean) => {
    const progress = loadingProgressRef.current;
    const pluginName = progress?.pendingPluginNamesByUuid.get(uuid);
    // Scripts of a superseded plugin configuration still settle; they are not counted.
    if (!progress || pluginName === undefined) return;

    progress.pendingPluginNamesByUuid.delete(uuid);
    if (loaded) {
      progress.loadedPluginNames.push(pluginName);
    } else {
      progress.failedPluginNames.push(pluginName);
    }
    if (progress.pendingPluginNamesByUuid.size === 0) {
      logPluginsLoadingSummary(progress);
    }
  }, []);

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

  const {
    data: allPublicEntriesFromDataChannel,
  } = createUseSubscription<DataChannelEntry>(
    PLUGIN_DATA_CHANNEL_PUBLIC_SUBSCRIPTION,
    {}, true,
  )((obj) => obj);

  const {
    data: allPrivateEntriesFromDataChannel,
  } = createUseSubscription<DataChannelEntry>(
    PLUGIN_DATA_CHANNEL_PRIVATE_SUBSCRIPTION,
    {}, true,
  )((obj) => obj);

  const allEntriesFromDataChannel = mergeDataChannelEntries(
    allPublicEntriesFromDataChannel,
    allPrivateEntriesFromDataChannel,
  );

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
          const {
            uuid,
            name: pluginName,
            localesBaseUrl,
            loggerSettings,
          } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = BbbPluginSdk.getPluginApi(uuid, pluginName, localesBaseUrl);
          return (
            <div key={uuid}>
              <PluginLoaderManager
                {...{
                  uuid,
                  containerRef,
                  onPluginLoadSettled: handlePluginLoadSettled,
                  loggerSettings,
                  pluginApi,
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
                  dataChannelEntries: allEntriesFromDataChannel,
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
