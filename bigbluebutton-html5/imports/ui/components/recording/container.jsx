import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import RecordingComponent from './component';

const RecordingContainer = props => <RecordingComponent {...props} />;

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

export default withModalMounter(withTracker(({ mountModal }) => {
  const { recording, time } = Meetings.findOne({ meetingId: Auth.meetingID }).recordProp;

  return ({
    closeModal: () => mountModal(null),

    toggleRecording: () => {
      const isUserModerator = Users.findOne({ userId: Auth.userID }).role === ROLE_MODERATOR;
      if (isUserModerator) makeCall('toggleRecording');

      mountModal(null);
    },

    recordingStatus: recording,
    recordingTime: time,

  });
})(RecordingContainer));
