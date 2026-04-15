import { gql } from '@apollo/client';
import { User } from '/imports/ui/components/video-provider/types';

export interface ViewerVideoStreamsSubscriptionResponse {
  user_camera_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface AudioOnlyUsersResponse {
  user: Array<User & {
    voice: {
      floor: boolean;
      lastFloorTime: string;
      joined: boolean;
      listenOnly: boolean;
      userId: string;
      deafened: boolean;
    };
  }>;
}

export const VIDEO_STREAMS_SUBSCRIPTION = gql`
  subscription VideoStreams {
    user_camera {
      meetingId
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
        bot:{ _eq: false },
      },
      limit: $limit,
      order_by: {
        nameSortable: asc,
        userId: asc,
      },
    ) {
      meetingId
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

export const AUDIO_ONLY_USERS_SUBSCRIPTION = gql`
  subscription AudioOnlyUsers {
    user(
      where: {
        cameras_aggregate: {
          count: {
            predicate: { _eq: 0 },
          },
        },
        voice: {
          lastFloorTime: {
            _gt: "0",
          },
        },
      },
      order_by: {
        voice: {
          lastFloorTime: desc,
        },
      },
    ) {
      meetingId
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

export default {
  OWN_VIDEO_STREAMS_QUERY,
  VIDEO_STREAMS_SUBSCRIPTION,
  VIEWERS_IN_WEBCAM_COUNT_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
  AUDIO_ONLY_USERS_SUBSCRIPTION,
};
