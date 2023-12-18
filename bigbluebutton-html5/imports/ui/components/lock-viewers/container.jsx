import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import LockViewersComponent from './component';
import { updateLockSettings, updateWebcamsOnlyForModerator } from './service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  return amIModerator && <LockViewersComponent {...props} />;
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  meeting: Meetings.findOne({ meetingId: Auth.meetingID }),
  updateLockSettings,
  updateWebcamsOnlyForModerator,
  showToggleLabel: false,
}))(LockViewersContainer);
