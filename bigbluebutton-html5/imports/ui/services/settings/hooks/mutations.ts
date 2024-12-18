import { gql } from '@apollo/client';

export const USER_CHANGED_LOCAL_SETTINGS = gql`
  mutation UserChangedLocalSettings($settings: json!) {
    userSetClientSettings(
      userClientSettingsJson: $settings
    )
  }
`;

export default {
  USER_CHANGED_LOCAL_SETTINGS,
};
