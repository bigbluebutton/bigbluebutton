import { gql } from '@apollo/client';

export const AUDIO_GROUP_STREAMS_SUBSCRIPTION = gql`
  subscription AudioGroupStreams {
    user_audioGroup {
      userId
      groupId
      participantType
      active
    }
  }
`;

export const MY_AUDIO_GROUPS = gql`
  query MyAudioGroups($userId: String!) {
    user_audioGroup(
      where: {
        userId: { _eq: $userId }
      }
    ) {
      groupId
      participantType
      active
    }
  }
`;
