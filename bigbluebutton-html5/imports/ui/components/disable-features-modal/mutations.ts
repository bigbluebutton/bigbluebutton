import { gql } from '@apollo/client';

export interface SetDisabledFeaturesMutationVars {
  disabledFeatures: string[];
}

export const SET_DISABLED_FEATURES = gql`
  mutation setDisabledFeatures($disabledFeatures: [String]!) {
    ChangeDisabledFeaturesInMeeting(disabledFeatures: $disabledFeatures)
  }
`;

export default {
  SET_DISABLED_FEATURES,
};
