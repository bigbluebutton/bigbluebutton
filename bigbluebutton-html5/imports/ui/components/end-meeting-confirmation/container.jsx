import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { makeCall } from '/imports/ui/services/api';
import EndMeetingComponent from './component';
import Service from './service';
import logger from '/imports/startup/client/logger';

const EndMeetingContainer = (props) => <EndMeetingComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  endMeeting: () => {
    logger.warn({
      logCode: 'moderator_forcing_end_meeting',
      extraInfo: { logType: 'user_action' },
    }, 'this user clicked on EndMeeting and confirmed, removing everybody from the meeting');
    makeCall('endMeeting');
    mountModal(null);
  },
  meetingTitle: Service.getMeetingTitle(),
  users: Service.getUsers(),
}))(EndMeetingContainer));
