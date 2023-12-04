import { gql } from '@apollo/client';

export const SET_AWAY = gql`
  mutation SetAway($away: Boolean!) {
    userSetAway(
      away: $away,
    )
  }
`;

export default { SET_AWAY };
