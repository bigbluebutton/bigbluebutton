import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import LockViewersComponent from './component';

const LockViewersContainer = props => <LockViewersComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal() {
    mountModal(null);
  },

  toggleLockSettings(meeting) {
    makeCall('toggleLockSettings', meeting);
  },

  toggleWebcamsOnlyForModerator(meeting) {
    makeCall('toggleWebcamsOnlyForModerator', meeting);
  },
  meeting: (Meetings.findOne({ meetingId: Auth.meetingID })),
}))(LockViewersContainer));
