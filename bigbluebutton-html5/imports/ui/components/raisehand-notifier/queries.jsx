import { gql } from '@apollo/client';

export const RAISED_HAND_USERS = gql`
subscription RaisedHandUsers {
  user(
    where: {
      raiseHand: {_eq: true}
    },
    order_by: [
      {raiseHandTime: asc_nulls_last},
    ]) {
    userId
    name
    color
    presenter
    isModerator
    raiseHand
    raiseHandTime
  }
}`;

export default {
  RAISED_HAND_USERS,
};
