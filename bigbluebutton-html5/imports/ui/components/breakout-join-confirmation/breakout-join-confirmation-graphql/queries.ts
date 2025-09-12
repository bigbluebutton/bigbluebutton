import { gql } from '@apollo/client';

export interface BreakoutRoom {
  shortName: string;
  sequence: number;
  showInvitation: boolean;
  isLastAssignedRoom: boolean;
  joinURL: string | null;
  breakoutRoomId: string;
  isDefaultName: boolean;
  isUserCurrentlyInRoom: boolean;
  participants: Array<{
    userId: string;
    isAudioOnly: string;
    user: {
      name: string;
      nameSortable: string;
    }
  }>
}

export interface GetBreakoutDataResponse {
  breakoutRoom: BreakoutRoom[];
}

export const handleInviteDismissedAt = gql`
  mutation {
    breakoutRoomSetInviteDismissed
  }
`;

export const getBreakoutData = gql`
  subscription Patched_getBreakoutData {
    breakoutRoom(order_by: {sequence: asc}){
      shortName
      sequence
      showInvitation
      isLastAssignedRoom
      joinURL
      breakoutRoomId
      isDefaultName
      isUserCurrentlyInRoom
      participants(order_by: {userId: asc}) {
        userId
        isAudioOnly
        user {
          name
          nameSortable
        }
      }
    }
  }
`;

export default {
  getBreakoutData,
};
