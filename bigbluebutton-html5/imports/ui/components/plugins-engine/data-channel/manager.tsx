import React, { useEffect, useState } from 'react';
import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import { DataChannelArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import {
  HookEventWrapper, UnsubscribedEventDetails, SubscribedEventDetails,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataChannelHooks, DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { MapInformation, PluginDataChannelManagerProps } from './types';
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
  ] = useState(new Map<string, MapInformation>());

  const updateHookUsage = (channelName: string,
    pluginName: string, deltaSubscribe: number,
    dataChannelType: DataChannelTypes, subChannelName: string) => {
    setMapOfDataChannelInformation((
      previousMap,
    ) => {
      if (pluginName === pluginNameInUse) {
        const uniqueId = createChannelIdentifier(channelName, subChannelName, pluginName);
        const newMap = new Map<string, MapInformation>(previousMap.entries());
        let newArrayTypes: DataChannelTypes[] = previousMap.get(uniqueId)?.types || [];
        if (deltaSubscribe < 0) {
          const index = newArrayTypes.indexOf(dataChannelType);
          if (index > -1) {
            newArrayTypes.splice(index, 1);
          }
        } else {
          newArrayTypes = newArrayTypes.concat([dataChannelType]);
        }
        newMap.set(uniqueId, {
          totalUses: (previousMap.get(uniqueId)?.totalUses || 0) + deltaSubscribe,
          subChannelName,
          channelName,
          types: [...new Set(newArrayTypes)],
        });
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
          const hookArguments = eventDetails?.hookArguments as DataChannelArguments;
          const dataChannelTypeFromEvent = hookArguments.dataChannelType!;
          const { subChannelName } = hookArguments;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName,
              hookArguments.pluginName, 1, dataChannelTypeFromEvent, subChannelName);
          }
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        if (event.detail.hook === DataChannelHooks.DATA_CHANNEL_BUILDER) {
          const eventDetails = event.detail as UnsubscribedEventDetails;
          const hookArguments = eventDetails?.hookArguments as DataChannelArguments;
          const dataChannelTypeFromEvent = hookArguments.dataChannelType!;
          const { subChannelName } = hookArguments;
          if (hookArguments?.channelName && hookArguments?.pluginName) {
            updateHookUsage(hookArguments.channelName,
              hookArguments.pluginName, -1, dataChannelTypeFromEvent, subChannelName);
          }
        }
      }) as EventListener;

    window.addEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
    window.addEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, subscribeHandler);
      window.removeEventListener(HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE, unsubscribeHandler);
    };
  }, []);

  return (
    <>
      {
        Array.from(mapOfDataChannelInformation.keys()).filter(
          (keyIdentifier: string) => mapOfDataChannelInformation.get(keyIdentifier) !== undefined
        && mapOfDataChannelInformation.get(keyIdentifier)!.totalUses > 0,
        ).map((keyIdentifier: string) => {
          const { subChannelName, channelName } = mapOfDataChannelInformation.get(keyIdentifier)!;
          const identifier = createChannelIdentifier(
            channelName, subChannelName, pluginNameInUse,
          );
          return (
            <DataChannelItemManager
              {...{
                key: identifier,
                identifier,
                pluginName: pluginNameInUse,
                channelName,
                subChannelName,
                dataChannelTypes: mapOfDataChannelInformation.get(keyIdentifier)!.types,
                pluginApi,
              }}
            />
          );
        })
      }
    </>
  );
}) as React.ElementType<PluginDataChannelManagerProps>;

export default PluginDataChannelManager;
