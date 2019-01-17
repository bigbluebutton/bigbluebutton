import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import EndMeetingComponent from './component';

const EndMeetingContainer = props => <EndMeetingComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal() {
    mountModal(null);
  },

  endMeeting: () => {
    makeCall('endMeeting');
    mountModal(null);
  },

}))(EndMeetingContainer));
