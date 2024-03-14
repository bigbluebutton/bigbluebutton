import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation } from '@apollo/client';
import EndMeetingComponent from './component';
import Service from './service';
import logger from '/imports/startup/client/logger';
import { MEETING_END } from './mutations';

const EndMeetingContainer = (props) => {
  const [meetingEnd] = useMutation(MEETING_END);
  const { setIsOpen } = props;

  const endMeeting = () => {
    logger.warn({
      logCode: 'moderator_forcing_end_meeting',
      extraInfo: { logType: 'user_action' },
    }, 'this user clicked on EndMeeting and confirmed, removing everybody from the meeting');
    meetingEnd();
    setIsOpen(false);
  };

  return <EndMeetingComponent endMeeting={endMeeting} {...props} />;
};

export default withTracker(() => ({
  meetingTitle: Service.getMeetingTitle(),
  users: Service.getUsers(),
}))(EndMeetingContainer);
