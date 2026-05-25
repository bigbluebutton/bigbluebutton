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
    user_camera(
      order_by: {
        userId: asc,
      }
    ) {
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

// Grid shows users who aren't displayed as a video tile for the current user.
// We exclude camera-sharers whose isModerator is in $excludedModeratorValues:
// [true, false] excludes every camera-sharer, while locked viewers pass [true] so
// non-moderator camera-sharers they can't see in the video streams still surface here.
export const GRID_USERS_SUBSCRIPTION = gql`
  subscription GridUsers($limit: Int!, $excludedModeratorValues: [Boolean!]) {
    user(
      where: {
        _not: {
          isSharingCamera: { _eq: true },
          isModerator: { _in: $excludedModeratorValues },
        },
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

// Audio-only shows users with floor time who aren't displayed as a video tile for the current user.
export const AUDIO_ONLY_USERS_SUBSCRIPTION = gql`
  subscription AudioOnlyUsers($excludedModeratorValues: [Boolean!]) {
    user(
      where: {
        _not: {
          isSharingCamera: { _eq: true },
          isModerator: { _in: $excludedModeratorValues },
        },
        lastFloorTime: { _neq: "0" },
      },
      order_by: {
        lastFloorTime: desc,
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
