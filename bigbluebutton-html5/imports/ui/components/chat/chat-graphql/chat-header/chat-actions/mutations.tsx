import { gql } from '@apollo/client';

export const CHAT_PUBLIC_CLEAR_HISTORY = gql`
  mutation {
    chatPublicClearHistory
  }
`;

export default {
  CHAT_PUBLIC_CLEAR_HISTORY,
};
