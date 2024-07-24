import { gql } from '@apollo/client';

const SEND_MESSAGE = gql`
  mutation ChatSendMessageFromPlugin(
    $chatId: String!,
    $chatMessageInMarkdownFormat: String!,
    $pluginName: String!,
    $pluginCustomMetadata: String
  ) {
    chatSendMessageFromPlugin(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat,
      pluginName: $pluginName,
      pluginCustomMetadata: $pluginCustomMetadata
    )
  }
`;

export default SEND_MESSAGE;
