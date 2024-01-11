import { gql } from '@apollo/client';

export const SET_LOCK_SETTINGS_PROPS = gql`
  mutation SetLockSettings(
    $disableCam: Boolean!,
    $disableMic: Boolean!,
    $disablePrivChat: Boolean!,
    $disablePubChat: Boolean!,
    $disableNotes: Boolean!,
    $hideUserList: Boolean!,
    $lockOnJoin: Boolean!,
    $lockOnJoinConfigurable: Boolean!,
    $hideViewersCursor: Boolean!,
    $hideViewersAnnotation: Boolean!) {
      meetingLockSettingsSetProps(
        disableCam: $disableCam,
        disableMic: $disableMic,
        disablePrivChat: $disablePrivChat,
        disablePubChat: $disablePubChat,
        disableNotes: $disableNotes,
        hideUserList: $hideUserList,
        lockOnJoin: $lockOnJoin,
        lockOnJoinConfigurable: $lockOnJoinConfigurable,
        hideViewersCursor: $hideViewersCursor,
        hideViewersAnnotation: $hideViewersAnnotation,
      )
  }
`;

export default { SET_LOCK_SETTINGS_PROPS };
