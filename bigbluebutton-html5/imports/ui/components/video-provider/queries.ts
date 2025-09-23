import { gql } from '@apollo/client';

export interface ViewerVideoStreamsSubscriptionResponse {
  user_camera_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export const VIDEO_STREAMS_SUBSCRIPTION = gql`
  subscription VideoStreams {
    user_camera {
      streamId
      user {
        name
        userId
        nameSortable
        pinned
        away
        disconnected
        role
        avatar
        color
        presenter
        clientType
        raiseHand
        isModerator
        reactionEmoji
      }
      voice {
        floor
        lastFloorTime
        joined
        listenOnly
        userId
        deafened
      }
    }
  }
`;

export const OWN_VIDEO_STREAMS_QUERY = gql`
  query OwnVideoStreams($userId: String!, $streamIdPrefix: String!) {
    user_camera(
      where: {
        userId: { _eq: $userId },
        streamId: { _like: $streamIdPrefix }
      },
    ) {
      streamId
    }
  }
`;

export const VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION = gql`
  subscription ViewerVideoStreams {
    user_camera_aggregate(where: {
      user: { role: { _eq: "VIEWER" }, presenter: { _eq: false } }
    }) {
      aggregate {
        count
      }
    }
  }
`;

export const GRID_USERS_SUBSCRIPTION = gql`
  subscription GridUsers($limit: Int!) {
    user(
      where: {
        cameras_aggregate: {
          count: {
            predicate: { _eq: 0 },
          },
        },
      },
      limit: $limit,
      order_by: {
        nameSortable: asc,
        userId: asc,
      },
    ) {
      name
      userId
      nameSortable
      pinned
      away
      disconnected
      role
      avatar
      color
      presenter
      clientType
      raiseHand
      isModerator
      reactionEmoji
      voice {
        joined
        listenOnly
        userId
      }
    }
  }
`;

export default {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
};
