import { gql } from '@apollo/client';

type chatContent = {
  chatId: string;
  public: boolean;
  participant: {
    name: string;
  };
};

export interface GetChatDataResponse {
  chat: Array<chatContent>;
}

export const GET_CHAT_DATA = gql`
  query GetChatData($chatId: String!) {
    chat(where: { chatId: { _eq: $chatId } }) {
      chatId
      public
      participant {
        name
      }
    }
  }
`;

export const CLOSE_PRIVATE_CHAT_MUTATION = gql`
  mutation UpdateChatVisible($chatId: String, $visible: Boolean) {
    chatSetVisible(
      chatId: $chatId
      visible: $visible
    )
  }
`;
