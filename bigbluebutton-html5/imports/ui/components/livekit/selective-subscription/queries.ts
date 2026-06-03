import { gql } from '@apollo/client';

export const MEDIA_GROUP_STREAMS_SUBSCRIPTION = gql`
  subscription MediaGroupStreams {
    user_mediaGroup(
      order_by: [
        { createdAt: asc }
        { userId: asc }
        { groupId: asc }
      ]
    ) {
      userId
      groupId
      mediaType
      sender
      receiver
      active
    }
  }
`;

export const MY_MEDIA_GROUPS = gql`
  query MyMediaGroups($userId: String!) {
    user_mediaGroup(
      where: {
        userId: { _eq: $userId }
      }
    ) {
      groupId
      mediaType
      sender
      receiver
      active
    }
  }
`;
