import { gql } from '@apollo/client';

export interface BreakoutRoom {
  freeJoin: boolean;
  shortName: string;
  sendInvitationToModerators: boolean;
  sequence: number;
  showInvitation: boolean;
  isLastAssignedRoom: boolean;
  isUserCurrentlyInRoom: boolean;
  joinURL: string | null;
  breakoutRoomId: string;
}

export interface GetBreakoutDataResponse {
  breakoutRoom: BreakoutRoom[];
}

export interface BreakoutRoomAggregate {
  aggregate: {
    count: number;
  };
}

export interface GetBreakoutCountResponse {
  breakoutRoom_aggregate: BreakoutRoomAggregate;
}

export const handleInviteDismissedAt = gql`
  mutation {
    breakoutRoomSetInviteDismissed
  }
`;

export const getBreakoutCount = gql`
  subscription getBreakoutCount  {
    breakoutRoom_aggregate (where: {showInvitation: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }
`;

export const getBreakoutData = gql`
  subscription getBreakoutData {
    breakoutRoom {
      freeJoin
      shortName
      sendInvitationToModerators
      sequence
      showInvitation
      isLastAssignedRoom
      isUserCurrentlyInRoom
      joinURL
      breakoutRoomId
    }
  }
`;

export default {
  getBreakoutCount,
  getBreakoutData,
};
