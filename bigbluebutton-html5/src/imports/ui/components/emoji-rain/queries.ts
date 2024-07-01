import { gql } from '@apollo/client';

export const getEmojisToRain = gql`
subscription getEmojisToRain ($initialCursor: timestamptz) {
  user_reaction_stream(batch_size: 10, cursor: {initial_value: {createdAt: $initialCursor}}) {
    createdAt
    reactionEmoji
  }
}
`;

export default {
  getEmojisToRain,
};
