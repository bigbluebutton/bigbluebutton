import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import LockViewersComponent from './component';
import { updateLockSettings, updateWebcamsOnlyForModerator } from './service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    role: user.role,
  }));
  const amIModerator = currentUserData?.role === ROLE_MODERATOR;

  return amIModerator && <LockViewersComponent {...props} />
};

export default withTracker(({ setIsOpen }) => ({
  closeModal: () => setIsOpen(false),
  meeting: Meetings.findOne({ meetingId: Auth.meetingID }),
  updateLockSettings,
  updateWebcamsOnlyForModerator,
  showToggleLabel: false,
}))(LockViewersContainer);
