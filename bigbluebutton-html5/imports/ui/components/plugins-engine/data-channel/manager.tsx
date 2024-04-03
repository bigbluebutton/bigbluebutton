import React, { useEffect, useState } from 'react';
import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import { DataChannelArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import {
  HookEventWrapper, UnsubscribedEventDetails, SubscribedEventDetails,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataChannelHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { PluginDataChannelManagerProps } from './types';
import { DataChannelItemManager } from './channel-manager/manager';

const PluginDataChannelManager: React.ElementType<PluginDataChannelManagerProps> = ((
  props: PluginDataChannelManagerProps,
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
      (event: HookEventWrapper<void>) => {
        if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_BUILDER) {
          const eventDetails = event.detail as SubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName, hookArguments.pluginName, 1);
          }
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_BUILDER) {
          const eventDetails = event.detail as UnsubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as DataChannelArguments | undefined;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName, hookArguments.pluginName, 1);
          }
        }
      }) as EventListener;

    window.addEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
    window.addEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
      window.removeEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
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
                key: createChannelIdentifier(keyChannelName, pluginNameInUse),
                pluginName: pluginNameInUse,
                channelName: keyChannelName,
                pluginApi,
              }}
            />
          ))
      }
    </>
  );
}) as React.ElementType<PluginDataChannelManagerProps>;

export default PluginDataChannelManager;
