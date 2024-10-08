import React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import { DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { DataChannelItemManagerReader } from './reader-manager';
import DataChannelItemManagerWriter from './writer-manager';

export interface DataChannelItemManagerProps {
  identifier: string;
  pluginName: string;
  channelName: string;
  subChannelName: string;
  pluginApi: PluginSdk.PluginApi;
  dataChannelTypes: DataChannelTypes[];
}

export const DataChannelItemManager: React.ElementType<DataChannelItemManagerProps> = (
  props: DataChannelItemManagerProps,
) => {
  const {
    identifier,
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
          subChannelName,
          dataChannelIdentifier,
        }}
      />
      {
        dataChannelTypes.map((type) => (
          <DataChannelItemManagerReader
            {...{
              key: identifier?.concat('::')?.concat(type),
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
