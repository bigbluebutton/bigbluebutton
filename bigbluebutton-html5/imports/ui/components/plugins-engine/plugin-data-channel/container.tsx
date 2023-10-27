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

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        if (event.detail.hook === PluginSdk.Internal.BbbDataChannel.UseDataChannel) {
          const eventDetails = event.detail as PluginSdk.DataChannelPluginHookEventDetail<void>;
          if (eventDetails.parameters.channelName && eventDetails.parameters.pluginName) {
            updateHookUsage(eventDetails.parameters.channelName, eventDetails.parameters.pluginName, 1);
          }
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        if (event.detail.hook === PluginSdk.Internal.BbbDataChannel.UseDataChannel) {
          const eventDetails = event.detail as PluginSdk.DataChannelPluginHookEventDetail<void>;
          if (eventDetails.parameters.channelName && eventDetails.parameters.pluginName) {
            updateHookUsage(eventDetails.parameters.channelName, eventDetails.parameters.pluginName, -1);
          }
        }
      }) as EventListener;

    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, subscribeHandler);
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, subscribeHandler);
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler);
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
              }}
            />
          ))
      }
    </>
  );
}) as React.ElementType<PluginDataChannelManagerContainerProps>;

export default PluginDataChannelManagerContainer;
