import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { useMutation } from '@apollo/client';
import LockViewersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_LOCK_SETTINGS_PROPS, SET_WEBCAM_ONLY_FOR_MODERATOR } from './mutations';

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const [setLockSettingsProps] = useMutation(SET_LOCK_SETTINGS_PROPS);
  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);

  const updateLockSettings = (lockSettings) => {
    setLockSettingsProps({
      variables: {
        disableCam: lockSettings.disableCam,
        disableMic: lockSettings.disableMic,
        disablePrivChat: lockSettings.disablePrivateChat,
        disablePubChat: lockSettings.disablePublicChat,
        disableNotes: lockSettings.disableNotes,
        hideUserList: lockSettings.hideUserList,
        lockOnJoin: lockSettings.lockOnJoin,
        lockOnJoinConfigurable: lockSettings.lockOnJoinConfigurable,
        hideViewersCursor: lockSettings.hideViewersCursor,
        hideViewersAnnotation: lockSettings.hideViewersAnnotation,
      },
    });
  };

  const updateWebcamsOnlyForModerator = (webcamsOnlyForModerator) => {
    setWebcamOnlyForModerator({
      variables: {
        webcamsOnlyForModerator,
      },
    });
  };

  return amIModerator && (
    <LockViewersComponent
      updateWebcamsOnlyForModerator={updateWebcamsOnlyForModerator}
      updateLockSettings={updateLockSettings}
      {...props}
    />
  );
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  meeting: Meetings.findOne({ meetingId: Auth.meetingID }),
  showToggleLabel: false,
}))(LockViewersContainer);
