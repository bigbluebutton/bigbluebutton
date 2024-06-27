import { gql } from '@apollo/client';
import type { User } from './types';

interface Voice {
  floor: boolean;
  lastFloorTime: string;
}

export interface VideoStreamsResponse {
  user_camera: {
    streamId: string;
    user: User;
    voice?: Voice;
  }[];
}

export interface GridUsersResponse {
  user: User[];
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
        raiseHand
        isModerator
        reactionEmoji
      }
      voice {
        floor
        lastFloorTime
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
      raiseHand
      isModerator
      reactionEmoji
    }
  }
`;

export default {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
};
