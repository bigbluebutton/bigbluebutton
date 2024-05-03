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
    loggedOut: boolean;
    away: boolean;
    disconnected: boolean;
    emoji: string;
    role: string;
    avatar: string;
    color: string;
    presenter: boolean;
    clientType: string;
    raiseHand: boolean;
    isModerator: boolean
    reaction: {
      reactionEmoji: string;
    };
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

export const VIDEO_STREAMS_USERS_SUBSCRIPTION = gql`
  subscription VideoStreamsUsers {
    user {
      name
      userId
      nameSortable
      pinned
      loggedOut
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
  VIDEO_STREAMS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  VIDEO_STREAMS_USERS_SUBSCRIPTION,
};
