import { gql } from '@apollo/client';

export const USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION = gql`
  subscription UsersWithAudioCount {
    user_aggregate(where: {voice: {joined: {_eq: true}}}) {
      aggregate {
        count
      }
    }
  }
`;

export default {
  USER_WITH_AUDIO_AGGREGATE_COUNT_SUBSCRIPTION,
};
