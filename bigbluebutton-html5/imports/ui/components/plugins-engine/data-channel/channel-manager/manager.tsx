import React from 'react';

import { createChannelIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/utils';
import { DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

import { DataChannelItemManagerReader } from './reader-manager';
import DataChannelItemManagerWriter from './writer-manager';

export interface DataChannelItemManagerProps {
  identifier: string;
  pluginName: string;
  channelName: string;
  subChannelName: string;
  dataChannelTypes: DataChannelTypes[];
  pluginUuid: string;
}

export const DataChannelItemManager: React.ElementType<DataChannelItemManagerProps> = (
  props: DataChannelItemManagerProps,
) => {
  const {
    identifier,
    pluginName,
    channelName,
    dataChannelTypes,
    subChannelName,
    pluginUuid,
  } = props;

  const dataChannelIdentifier = createChannelIdentifier(channelName, subChannelName, pluginName);

  return (
    <>
      <DataChannelItemManagerWriter
        {...{
          pluginName,
          channelName,
          subChannelName,
          dataChannelIdentifier,
          pluginUuid,
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
