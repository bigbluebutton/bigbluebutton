import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Message } from '/imports/ui/Types/message';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const formatLoadedChatMessagesDataFromGraphql = (
  responseDataFromGraphql: Partial<Message>[],
) => ({
  data: responseDataFromGraphql.map((chatMessagesData) => ({
    createdAt: chatMessagesData.createdAt,
    message: chatMessagesData.message,
    messageId: chatMessagesData.messageId,
    senderUserId: chatMessagesData.user?.userId,
  }) as PluginSdk.LoadedChatMessage) : undefined,
  loading: responseDataFromGraphql.loading,
  error: responseDataFromGraphql.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedChatMessage>);

export default formatLoadedChatMessagesDataFromGraphql;
