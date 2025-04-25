import { gql } from '@apollo/client';

export const USER_SET_TALKING = gql`
  mutation UserSetTalking($talking: Boolean!) {
    userSetTalking(
      talking: $talking
    )
  }
`;

export const USER_SET_DEAFENED = gql`
  mutation UserSetDeafened($userId: String!, $deafened: Boolean!) {
    userSetDeafened(
      userId: $userId,
      deafened: $deafened
    )
  }
`;

export default {
  USER_SET_DEAFENED,
  USER_SET_TALKING,
};
