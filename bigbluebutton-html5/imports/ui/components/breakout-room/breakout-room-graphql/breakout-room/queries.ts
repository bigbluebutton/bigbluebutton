import { gql } from '@apollo/client';

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

export interface GetIfUserJoinedBreakoutRoomResponse {
  breakoutRoom_aggregate:{
  aggregate: {
    count: number;
  }
};
}

export const getBreakoutData = gql`
  subscription getBreakoutData {
    breakoutRoom(order_by: {sequence: asc}){
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

export const getIfUserJoinedBreakoutRoom = gql`
  subscription getIdUserJoinedABreakout {
    breakoutRoom_aggregate(where: {currentRoomJoined: {_eq: true}}) {
      aggregate {
        count
      }
    }
  }
`;

export default {
  getBreakoutData,
  getIfUserJoinedBreakoutRoom,
};
