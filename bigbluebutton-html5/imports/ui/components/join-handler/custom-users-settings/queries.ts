import { gql } from '@apollo/client';

interface UserMetadata {
  parameter: string;
  value: string;
}

export interface UserMetadataResponse {
  user_metadata: UserMetadata[];
}

export const getUserMetadata = gql`
  query getUserMetadata {
    user_metadata {
      parameter
      value
    }
  }
`;

export default {
  getUserMetadata,
};
