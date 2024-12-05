import { gql } from '@apollo/client';

export const changeEnforcedLayout = gql`
  mutation ChangeEnforcedLayout($newLayout: String!) {
    user_current(
      enforceLayout: $newLayout,
    )
  }
`;

export default {
  changeEnforcedLayout,
};
