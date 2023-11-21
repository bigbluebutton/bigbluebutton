import React, { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginDataChannelManagerContainerProps } from '../types';
import { DataChannelItemManager } from './dataChannelItemManager/container';

const PluginDataChannelManagerContainer: React.ElementType<PluginDataChannelManagerContainerProps> = ((
  props: PluginDataChannelManagerContainerProps,
) => {
  const {
    pluginApi,
  } = props;

  const { pluginName: pluginNameInUse } = pluginApi;
  if (!pluginNameInUse) return (<></>);
  const [
    mapOfDataChannelInformation,
    setMapOfDataChannelInformation,
  ] = useState(new Map<string, number>());

  const updateHookUsage = (channelName: string, pluginName: string, deltaSubscribe: number) => {
    setMapOfDataChannelInformation((
      previousMap: Map<string, number>,
    ) => {
      if (pluginName === pluginNameInUse) {
        const newMap = new Map<string, number>(previousMap.entries());
        newMap.set(channelName, (previousMap.get(channelName) || 0) + deltaSubscribe);
        return newMap;
      }
      return previousMap;
    });
  };

  // Alterar aqui
  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: PluginSdk.HookEventWrapper<void>) => {
        if (event.detail.hook === PluginSdk.Hooks.DATA_CHANNEL) {
          const eventDetails = event.detail as PluginSdk.SubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as PluginSdk.DataChannelArguments | undefined;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName, hookArguments.pluginName, 1);
          }
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.HookEventWrapper<void>) => {
        if (event.detail.hook === PluginSdk.Hooks.DATA_CHANNEL) {
          const eventDetails = event.detail as PluginSdk.UnsubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as PluginSdk.DataChannelArguments | undefined;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName, hookArguments.pluginName, 1);
          }
        }
      }) as EventListener;

    window.addEventListener(PluginSdk.HookEvents.SUBSCRIBED, subscribeHandler);
    window.addEventListener(PluginSdk.HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    return () => {
      window.removeEventListener(PluginSdk.HookEvents.SUBSCRIBED, subscribeHandler);
      window.removeEventListener(PluginSdk.HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    };
  }, []);

  return (
    <>
      {
          Array.from(mapOfDataChannelInformation.keys()).filter(
            (keyChannelName: string) => mapOfDataChannelInformation.get(keyChannelName) !== undefined
          && mapOfDataChannelInformation.get(keyChannelName)! > 0,
          ).map((keyChannelName: string) => (
            <DataChannelItemManager
              {...{
                key: PluginSdk.createChannelIdentifier(keyChannelName, pluginNameInUse),
                pluginName: pluginNameInUse,
                channelName: keyChannelName,
                pluginApi,
              }}
            />
          ))
      }
    </>
  );
}) as React.ElementType<PluginDataChannelManagerContainerProps>;

export default PluginDataChannelManagerContainer;
