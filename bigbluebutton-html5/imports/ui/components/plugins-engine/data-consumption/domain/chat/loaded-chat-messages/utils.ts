import { Message } from '/imports/ui/Types/message';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const formatLoadedChatMessagesDataFromGraphql = (
  responseData: Partial<Message>[],
) => ({
  data: responseData.map((chatMessagesData) => ({
    createdAt: chatMessagesData.createdAt,
    message: chatMessagesData.message,
    messageId: chatMessagesData.messageId,
    senderUserId: chatMessagesData.user?.userId,
    messageMetadata: chatMessagesData.messageMetadata,
  }) as PluginSdk.LoadedChatMessage),
  loading: !(responseData),
  error: undefined,
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedChatMessage[]>);

export default formatLoadedChatMessagesDataFromGraphql;
