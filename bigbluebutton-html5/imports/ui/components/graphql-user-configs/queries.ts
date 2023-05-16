import {gql} from "@apollo/client";

export const USER_CUSTOM_PARAMETER_QUERY = gql`
query {
    user_customParameter {
      parameter
      value
    }
  }
`;

export default {
    USER_CUSTOM_PARAMETER_QUERY,
}
