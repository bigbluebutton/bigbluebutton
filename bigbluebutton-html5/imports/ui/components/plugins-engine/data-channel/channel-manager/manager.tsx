import React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import { DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { DataChannelItemManagerReader } from './reader-manager';
import DataChannelItemManagerWriter from './writer-manager';

export interface DataChannelItemManagerProps {
  pluginName: string;
  channelName: string;
  subChannelName: string;
  pluginApi: PluginSdk.PluginApi;
  dataChannelTypes: DataChannelTypes[];
}

export interface MutationVariables {
  pluginName: string,
  dataChannel: string,
  payloadJson: string,
  toRoles: PluginSdk.DataChannelDispatcherUserRole[],
  toUserIds: string[],
}

export interface SubscriptionVariables {
  subChannelName: string;
  pluginName: string;
  channelName: string;
  createdAt?: string;
}

export const DataChannelItemManager: React.ElementType<DataChannelItemManagerProps> = (
  props: DataChannelItemManagerProps,
) => {
  const {
    pluginName,
    channelName,
    pluginApi,
    dataChannelTypes,
    subChannelName,
  } = props;

  const dataChannelIdentifier = createChannelIdentifier(channelName, subChannelName, pluginName);

  return (
    <>
      <DataChannelItemManagerWriter
        {...{
          pluginName,
          channelName,
          pluginApi,
          dataChannelTypes,
          subChannelName,
          dataChannelIdentifier,
        }}
      />
      {
        dataChannelTypes.map((type) => (
          <DataChannelItemManagerReader
            {...{
              pluginName,
              channelName,
              dataChannelType: type,
              subChannelName,
              dataChannelIdentifier,
            }}
          />
        ))
      }
    </>
  );
};
