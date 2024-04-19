import React, { useEffect, useRef } from 'react';
import { DocumentNode } from 'graphql';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { GraphqlResponseWrapper, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DataChannelHooks, DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { PLUGIN_DATA_CHANNEL_LATEST_ITEM, PLUGIN_DATA_CHANNEL_NEW_ITEMS, PLUGIN_DATA_CHANNEL_All_ITEMS } from '../subscriptions';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';

export interface DataChannelItemManagerReaderProps {
  pluginName: string;
  channelName: string;
  subChannelName: string;
  dataChannelType: DataChannelTypes;
  dataChannelIdentifier: string;
}

export interface MutationVariables {
  pluginName: string,
  dataChannel: string,
  payloadJson: string,
  toRoles: PluginSdk.DataChannelPushEntryFunctionUserRole[],
  toUserIds: string[],
}

export interface SubscriptionVariables {
  subChannelName: string;
  pluginName: string;
  channelName: string;
  createdAt?: string;
}

export const DataChannelItemManagerReader: React.ElementType<DataChannelItemManagerReaderProps> = (
  props: DataChannelItemManagerReaderProps,
) => {
  const {
    pluginName,
    channelName,
    dataChannelType,
    subChannelName,
    dataChannelIdentifier,
  } = props;
  const cursor = useRef(new Date());
  let subscription: DocumentNode;
  const variables: SubscriptionVariables = {
    subChannelName,
    pluginName,
    channelName,
  };
  let usePatchedSubscription = true;
  switch (dataChannelType) {
    case DataChannelTypes.LATEST_ITEM:
      subscription = PLUGIN_DATA_CHANNEL_LATEST_ITEM;
      usePatchedSubscription = false;
      break;
    case DataChannelTypes.NEW_ITEMS:
      subscription = PLUGIN_DATA_CHANNEL_NEW_ITEMS;
      variables.createdAt = cursor.current.toISOString();
      usePatchedSubscription = false;
      break;
    case DataChannelTypes.All_ITEMS:
      subscription = PLUGIN_DATA_CHANNEL_All_ITEMS;
      break;
    default:
      subscription = PLUGIN_DATA_CHANNEL_All_ITEMS;
      break;
  }

  const dataResultFromSubscription = createUseSubscription<object>(subscription,
    variables, usePatchedSubscription)((obj) => obj);

  useEffect(() => {
    const dataResult = {
      data: dataResultFromSubscription.data,
      loading: dataResultFromSubscription.loading,
    } as GraphqlResponseWrapper<object>;
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<
      GraphqlResponseWrapper<object>
    >>(dataChannelIdentifier, {
      detail: {
        hook: DataChannelHooks.DATA_CHANNEL_BUILDER,
        data: dataResult,
        hookArguments: {
          dataChannelType,
          pluginName,
          channelName,
          subChannelName,
        },
      },
    }),
    );
  }, [dataResultFromSubscription]);

  return null;
};
