import { gql } from '@apollo/client';
import { User } from '/imports/ui/components/video-provider/types';

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
        pinnedTime
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

// Grid shows users who aren't displayed as a video tile for the current user.
// Camera-sharers are excluded (isSharingCamera = camerasCount > 0). When the user can
// only see moderator cameras (webcamsOnlyForModerator + locked), non-moderators are
// dropped too via $moderatorValues = [true]; otherwise [true, false] keeps everyone.
// NOTE: isSharingCamera is global and ignores per-viewer locks, so it is trusted only for
// moderators (their cameras reach everyone); non-moderator visibility is handled by role.
// The current user is intentionally NOT special-cased here (no per-user variable, so
// Hasura can still multiplex this subscription); self is re-added client-side instead.
export const GRID_USERS_SUBSCRIPTION = gql`
  subscription GridUsers($limit: Int!, $moderatorValues: [Boolean!]) {
    user(
      where: {
        cameras_aggregate: {
          count: {
            predicate: { _eq: 0 },
          },
        },
        bot:{ _eq: false },
        isSharingCamera: { _eq: false },
        isModerator: { _in: $moderatorValues },
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
      pinnedTime
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
// Same camera-sharer/role filtering as GRID_USERS_SUBSCRIPTION (see note there).
export const AUDIO_ONLY_USERS_SUBSCRIPTION = gql`
  subscription AudioOnlyUsers($moderatorValues: [Boolean!]) {
    user(
      where: {
        isSharingCamera: { _eq: false },
        isModerator: { _in: $moderatorValues },
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
      pinnedTime
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
  VIDEO_STREAMS_SUBSCRIPTION,
  GRID_USERS_SUBSCRIPTION,
  AUDIO_ONLY_USERS_SUBSCRIPTION,
};
