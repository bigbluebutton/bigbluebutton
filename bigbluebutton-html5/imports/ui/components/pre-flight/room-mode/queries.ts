import { gql } from '@apollo/client';

export interface GetRoomModeResponse {
  meeting: Array<{
    roomMode: string;
  }>;
}

// Read before the join, so the operation name is part of the contract: the
// middleware silently drops any operation from a user who has not joined yet
// unless its name is in AllowedSubscriptionsForNotInMeetingUsers. Never patch
// it either - Patched_getRoomMode is dropped the same way.
export const GET_ROOM_MODE = gql`
  subscription getRoomMode {
    meeting {
      roomMode
    }
  }
`;

export default GET_ROOM_MODE;
