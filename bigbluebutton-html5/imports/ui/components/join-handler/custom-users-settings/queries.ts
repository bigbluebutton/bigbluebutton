import { gql } from '@apollo/client';


export const getCustomParameter = gql`
  query getCustomParameter {
    user_customParameter {
      parameter
      value
    }
  }
`;

export default {
  getCustomParameter,
};
