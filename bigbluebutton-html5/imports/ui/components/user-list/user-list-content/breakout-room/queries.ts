import { gql } from '@apollo/client';

export const userIsInvited = gql`
  subscription userIsInvited {
    breakoutRoom(where: {joinURL: {_is_null: false}}) {
      sequence
    }
  }
`;

export const isBreakoutFreeJoin = gql`
  subscription breakoutsAreFreeJoin {
    breakoutRoom(where: {freeJoin: {_eq: true}}) {
      sequence
    }
  }
`;

export default {
  userIsInvited,
};
