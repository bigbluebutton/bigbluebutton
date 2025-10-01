import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

export interface PluginDataChannelManagerProps {
  pluginApi: PluginSdk.PluginApi;
  dataChannelEntries: DataChannelEntry[];
}

export interface MapInformation {
  totalUses: number;
  subChannelName: string;
  channelName: string;
  types: DataChannelTypes[];
}

export interface DataChannelEntry {
  createdAt: string;
  updatedAt: string;
  channelName: string;
  subChannelName: string;
  entryId: string;
  payloadJson: object;
  createdBy: string;
  fromUserId: string;
  pluginName: string;
  toRoles?: string[];
}
