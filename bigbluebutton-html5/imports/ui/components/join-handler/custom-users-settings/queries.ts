import { gql } from '@apollo/client';

interface CustomParameter {
  parameter: string;
  value: string;
}

export interface UserCustomParameterResponse {
  user_customParameter: CustomParameter[];
}

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
