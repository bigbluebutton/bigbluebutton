import { gql } from '@apollo/client';

export const USER_SET_TALKING = gql`
  mutation UserSetTalking($talking: Boolean!) {
    userSetTalking(
      talking: $talking
    )
  }
`;

export default {
  USER_SET_TALKING,
};
