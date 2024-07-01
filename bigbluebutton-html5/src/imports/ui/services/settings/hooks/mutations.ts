import { gql } from '@apollo/client';

export const USER_CHANGED_LOCAL_SETTINGS = gql`
  mutation UserChangedLocalSettings($settings: jsonb!) {
    update_user_clientSettings(
      where: {},
      _set: {
        userClientSettingsJson: $settings
      }
    ) {
      affected_rows
    }
  }
`;

export default {
  USER_CHANGED_LOCAL_SETTINGS,
};
