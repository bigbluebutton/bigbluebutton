import { gql } from '@apollo/client"''

export interface BreakoutRoom {
  freeJoin: boolean;
  shortName: string;
  sendInvitationToModerators: boolean;
  sequence: number;
  showInvitation: boolean;
  joinURL: string | null;
  breakoutRoomId: string;
  isDefaultName: boolean;
  currentRoomJoined: boolean;
  participants: Array<{
    user: {
      name: string;
      nameSortable: string;
      userId: string;
    }
  }>
}

export interface GetBreakoutDataResponse {
  breakoutRoom: BreakoutRoom[];
}

export const getBreakoutData = gql`
  subscription getBreakoutData {
    breakoutRoom {
      freeJoin
      shortName
      sendInvitationToModerators
      sequence
      showInvitation
      joinURL
      breakoutRoomId
      isDefaultName
      currentRoomJoined
      participants {
        user {
          name
          nameSortable
          userId
        }
      }
    }
  }
`;

export default {
  getBreakoutData,
};