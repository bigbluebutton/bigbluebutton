import { gql } from '@apollo/client';

export interface breakoutRoom {
  sequence: number;
  name: string;
  breakoutRoomMeetingId: string;
  participants: Array<{
    user: {
      name: string;
      userId: string;
      isModerator: boolean;
    }
  }>
}

export interface getBreakoutsResponse {
  breakoutRoom: Array<breakoutRoom>
}

export interface LastBreakoutData {
  user: {
    lastBreakoutRoom: {
      breakoutRoomMeetingId: string;
      isUserCurrentlyInRoom: boolean;
      sequence: number;
      shortName: string;
      userId: string;
    }
  }[];
  breakoutRoom_createdLatest: {
    sequence: number;
    shortName: string;
    isDefaultName: boolean;
  }[];
}

export interface getMeetingGroupResponse {
  meeting_group: {
    groupId : string;
    name: string;
    usersExtId: string[];
  }[];
}

export const getBreakouts = gql`
  query getBreakouts {
    breakoutRoom {
      sequence
      name
      breakoutRoomMeetingId
      participants {
        user {
          name
          userId
          isModerator
        }
      }
    }
  }
`;

export const getLastBreakouts = gql`
  query getLastBreakouts {
    user {
      lastBreakoutRoom {
        breakoutRoomMeetingId
        isUserCurrentlyInRoom
        sequence
        shortName
        userId
      }
    }
    breakoutRoom_createdLatest {
      sequence
      shortName
      isDefaultName
    }
  }
`;

export const getMeetingGroup = gql`
  query getMeetingGroup {
    meeting_group(order_by: {groupIndex: asc}) {
      groupId
      name
      usersExtId
    }
 }
`;

export default {
  getBreakouts,
  getLastBreakouts,
  getMeetingGroup,
};
