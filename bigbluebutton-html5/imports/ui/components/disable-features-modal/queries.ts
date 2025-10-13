import { gql } from '@apollo/client';

export interface DisabledFeaturesSubscriptionData {
  meeting: {
    disabledFeatures: string[];
  };
}

export const GET_DISABLED_FEATURES = gql`
  subscription getDisabledFeatures {
    meeting {
      disabledFeatures
    }
  }
`;

export default {
  GET_DISABLED_FEATURES,
};
