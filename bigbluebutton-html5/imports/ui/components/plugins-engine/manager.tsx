import React, {
  useEffect, useRef, useState,
} from 'react';
import { PluginBrowserWindow } from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import * as uuidLib from 'uuid';
import PluginDataConsumptionManager from './data-consumption/manager';
import PluginsEngineComponent from './component';
import { EffectivePluginConfig, PluginsEngineManagerProps } from './types';
import PluginLoaderManager from './loader/manager';
import ExtensibleAreaStateManager from './extensible-areas/manager';
import PluginDataChannelManager from './data-channel/manager';
import PluginUiCommandsHandler from './ui-commands/handler';
import PluginDomElementManipulationManager from './dom-element-manipulation/manager';
import PluginServerCommandsHandler from './server-commands/handler';
import PluginLearningAnalyticsDashboardManager from './learning-analytics-dashboard/manager';
import PluginEventPersistenceManager from './event-persistence/manager';

function getPluginApi(pluginName: string) {
  return {
    setUserListDropdownItems: () => [],
    setPresentationToolbarItems: () => [],
    setActionButtonDropdownItems: () => [],
    setActionsBarItems: () => [],
    setAudioSettingsDropdownItems: () => [],
    setPresentationDropdownItems: () => [],
    setNavBarItems: () => [],
    setScreenshareHelperItems: () => [],
    setUserCameraHelperItems: () => [],
    setOptionsDropdownItems: () => [],
    setCameraSettingsDropdownItems: () => [],
    setUserCameraDropdownItems: () => [],
    setUserListItemAdditionalInformation: () => [],
    setFloatingWindows: () => [],
    setGenericContentItems: () => [],
    mapOfPushEntryFunctions: {
      '': () => {},
    },
    pluginName,
  };
}

declare const window: PluginBrowserWindow;

const PluginsEngineManager = (props: PluginsEngineManagerProps) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project

  const { pluginConfig } = props;
  // If there is no plugin to load, the engine simply returns null

  const containerRef = useRef<HTMLDivElement>(null);
  const [lastLoadedPlugin, setLastLoadedPlugin] = useState<HTMLScriptElement | undefined>();
  const [effectivePluginsConfig, setEffectivePluginsConfig] = useState<EffectivePluginConfig[] | undefined>();
  const [numberOfLoadedPlugins, setNumberOfLoadedPlugins] = useState<number>(0);

  useEffect(() => {
    window.bbbPluginApiConstructors = {};
  }, []);

  useEffect(() => {
    setEffectivePluginsConfig(
      pluginConfig?.map((p) => ({
        ...p,
        name: p.name,
        url: p.javascriptEntrypointUrl,
        uuid: uuidLib.v4(),
      } as EffectivePluginConfig)),
    );
  }, [
    pluginConfig,
  ]);

  const totalNumberOfPlugins = pluginConfig?.length;

  useEffect(() => {
    if (totalNumberOfPlugins) logger.info(`${numberOfLoadedPlugins}/${totalNumberOfPlugins} plugins loaded`);
  },
  [numberOfLoadedPlugins, lastLoadedPlugin]);

  return (
    <>
      <PluginsEngineComponent
        {...{
          containerRef,
        }}
      />
      <PluginDataConsumptionManager />
      <PluginServerCommandsHandler />
      <PluginUiCommandsHandler />
      <PluginDomElementManipulationManager />
      {
        effectivePluginsConfig?.map((effectivePluginConfig: EffectivePluginConfig) => {
          const { uuid, name: pluginName } = effectivePluginConfig;
          const pluginApi: PluginSdk.PluginApi = getPluginApi(pluginName);
          return (
            <div key={uuid}>
              <PluginLoaderManager
                {...{
                  pluginApi,
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
