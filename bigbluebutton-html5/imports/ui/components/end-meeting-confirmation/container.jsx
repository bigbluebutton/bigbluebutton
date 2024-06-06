import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation, useSubscription } from '@apollo/client';
import EndMeetingComponent from './component';
import Service from './service';
import logger from '/imports/startup/client/logger';
import { MEETING_END } from './mutations';
import { USER_AGGREGATE_COUNT_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';

const EndMeetingContainer = (props) => {
  const [meetingEnd] = useMutation(MEETING_END);
  const {
    data: countData,
  } = useSubscription(USER_AGGREGATE_COUNT_SUBSCRIPTION);
  const users = countData?.user_aggregate?.aggregate?.count || 0;

  const { setIsOpen } = props;

  const endMeeting = () => {
    logger.warn({
      logCode: 'moderator_forcing_end_meeting',
      extraInfo: { logType: 'user_action' },
    }, 'this user clicked on EndMeeting and confirmed, removing everybody from the meeting');
    meetingEnd();
    setIsOpen(false);
  };

  return <EndMeetingComponent endMeeting={endMeeting} users={users} {...props} />;
};

export default withTracker(() => ({
  meetingTitle: Service.getMeetingTitle(),
}))(EndMeetingContainer);
