import { gql } from '@apollo/client';
import { User } from '../../Types/user';

export interface getVideoDataResponse {
  user: Array<Pick<User, 'loggedOut'| 'away'| 'disconnected'| 'emoji'| 'name'>>
}
export type queryUser = Pick<User, 'loggedOut'| 'away'| 'disconnected'| 'emoji'| 'name'>

export const getVideoData = gql`
subscription getvideoData($userIds: [String]!) {
  user(where: {userId: {_in: $userIds}}) {
    loggedOut
    away
    disconnected
    emoji
    name
    nameSortable
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

export const getVideoDataGrid = gql`
subscription getVideoDataGrid {
  user {
    loggedOut
    away
    disconnected
    emoji
    name
    nameSortable
    role
    avatar
    color
    presenter
    clientType
    userId
    raiseHand
    reaction {
      reactionEmoji
    }
  }
}
`;

export default {
  getVideoData,
  getVideoDataGrid,
};
