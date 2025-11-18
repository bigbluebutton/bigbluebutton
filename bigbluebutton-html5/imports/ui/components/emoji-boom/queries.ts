import { gql } from '@apollo/client';

export const EMOJI_BOOM_SUBSCRIPTION = gql`
  subscription EmojiBoom($initialCursor: timestamptz) {
    user_reaction_stream(
      batch_size: 10,
      cursor: {initial_value: {createdAt: $initialCursor}}
    ) {
      createdAt
      reactionEmoji
      userId
      user {
        color
        nameSortable
        isModerator
      }
    }
  }
`;

export default {
  EMOJI_BOOM_SUBSCRIPTION,
};
