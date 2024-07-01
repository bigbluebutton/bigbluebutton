import { gql } from '@apollo/client';

export const userIsInvited = gql`
  subscription userIsInvited {
    breakoutRoom(where: {joinURL: {_is_null: false}}) {
      sequence
    }
  }
`;

export default {
  userIsInvited,
};
