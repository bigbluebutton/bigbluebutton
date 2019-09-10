import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import LockViewersComponent from './component';
import { updateLockSettings, updateWebcamsOnlyForModerator } from './service';

const LockViewersContainer = props => <LockViewersComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal: () => mountModal(null),
  meeting: Meetings.findOne({ meetingId: Auth.meetingID }),
  updateLockSettings,
  updateWebcamsOnlyForModerator,
  showToggleLabel: false,
}))(LockViewersContainer));
