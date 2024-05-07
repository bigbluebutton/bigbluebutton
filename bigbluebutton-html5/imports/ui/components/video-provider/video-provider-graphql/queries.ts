import { gql } from '@apollo/client';

export interface VideoStreamsResponse {
  user_camera: {
    streamId: string;
    user: {
      userId: string;
      pinned: boolean;
      nameSortable: string;
      name: string;
      isModerator: boolean;
    };
    voice?: {
      floor: boolean;
      lastFloorTime: string;
    };
  }[];
}

export interface VideoStreamsUsersResponse {
  user: {
    userId: string;
    pinned: boolean;
    nameSortable: string;
    name: string;
    away: boolean;
    disconnected: boolean;
    emoji: string;
    role: string;
    avatar: string;
    color: string;
    presenter: boolean;
    clientType: string;
    raiseHand: boolean;
    isModerator: boolean;
    reaction: {
      reactionEmoji: string;
    };
  }[];
}

export interface OwnVideoStreamsResponse {
  user_camera: {
    streamId: string;
  }[];
}

export const VIDEO_STREAMS_SUBSCRIPTION = gql`
  subscription VideoStreams {
    user_camera {
      streamId
      user {
        userId
        pinned
        nameSortable
        name
        isModerator
      }
      voice {
        floor
        lastFloorTime
      }
    }
  }
`;

export const OWN_VIDEO_STREAMS_QUERY = gql`
  query OwnVideoStreams($userId: String!) {
    user_camera(
      where: {
        userId: { _eq: $userId }
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
  subscription GridUsers($exceptUserIds: [String]!, $limit: Int!) {
    user(
      where: {
        userId: {
          _nin: $exceptUserIds,
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
      emoji
      role
      avatar
      color
      presenter
      clientType
      userId
      raiseHand
      isModerator
      reaction {
        reactionEmoji
      }
    }
  }
`;

export const VIDEO_STREAMS_USERS_FILTERED_SUBSCRIPTION = gql`
  subscription FilteredVideoStreamsUsers($userIds: [String]!) {
    user(
      where: {
        userId: {
          _in: $userIds
        }
      }
    ) {
      name
      userId
      nameSortable
      pinned
      away
      disconnected
      emoji
      role
      avatar
      color
      presenter
      clientType
      userId
      raiseHand
      isModerator
      reaction {
        reactionEmoji
      }
    }
  }
`;

export default {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
  VIDEO_STREAMS_USERS_FILTERED_SUBSCRIPTION,
};
