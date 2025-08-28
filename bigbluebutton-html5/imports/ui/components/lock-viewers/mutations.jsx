import { gql } from '@apollo/client';

export const SET_LOCK_SETTINGS_PROPS = gql`
  mutation SetLockSettings(
    $disableCam: Boolean!,
    $disableMic: Boolean!,
    $disablePrivChat: Boolean!,
    $disablePubChat: Boolean!,
    $disableNotes: Boolean!,
    $hideUserList: Boolean!,
    $hideViewersCursor: Boolean!,
    $lockOnJoin: Boolean!,
    $lockOnJoinConfigurable: Boolean!,
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

export const SET_WEBCAM_ONLY_FOR_MODERATOR = gql`
  mutation SetWebcamOnlyForModerator($webcamsOnlyForModerator: Boolean!) {
    meetingSetWebcamOnlyForModerator(
      webcamsOnlyForModerator: $webcamsOnlyForModerator,
    )
  }
`;

export default { SET_LOCK_SETTINGS_PROPS, SET_WEBCAM_ONLY_FOR_MODERATOR };
