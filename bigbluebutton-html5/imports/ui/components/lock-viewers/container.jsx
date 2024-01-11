import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { useMutation } from '@apollo/client';
import LockViewersComponent from './component';
import { updateWebcamsOnlyForModerator } from './service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_LOCK_SETTINGS_PROPS } from './mutations';

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const [setLockSettingsProps] = useMutation(SET_LOCK_SETTINGS_PROPS);

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

  return amIModerator && <LockViewersComponent updateLockSettings={updateLockSettings} {...props} />;
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  meeting: Meetings.findOne({ meetingId: Auth.meetingID }),
  updateWebcamsOnlyForModerator,
  showToggleLabel: false,
}))(LockViewersContainer);
