import { DataChannelTypes } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/enums';

export interface PluginDataChannelManagerProps {
  pluginName: string;
  pluginUuid: string;
}

export interface MapInformation {
  totalUses: number;
  subChannelName: string;
  channelName: string;
  types: DataChannelTypes[];
}

export interface SubscriptionResultFromGraphqlStream {
  pluginDataChannelMessage_stream: object[]
}

export interface SubscriptionResultFromGraphql {
  pluginDataChannelMessage: object[]
}
