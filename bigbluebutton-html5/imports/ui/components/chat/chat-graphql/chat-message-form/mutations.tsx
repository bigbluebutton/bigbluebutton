import { gql } from '@apollo/client';

// Define the GraphQL mutation
export const SEND_GROUP_CHAT_MSG = gql`
  mutation SendGroupChatMsg($chatId: String!, $chatMessageInMarkdownFormat: String!) {
    sendGroupChatMsg(
      chatId: $chatId,
      chatMessageInMarkdownFormat: $chatMessageInMarkdownFormat
    )
  }
`;

export default { SEND_GROUP_CHAT_MSG };
