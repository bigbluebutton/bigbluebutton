import React, { useEffect } from 'react';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import MEETING_SUBSCRIPTION from '/imports/ui/core/graphql/queries/meetingSubscription';
import { Meeting } from '/imports/ui/Types/meeting';
import Meetings from '/imports/api/meetings';

const MeetingGrapQlMiniMongoAdapter: React.FC = () => {
  const meetingSubscription = useCreateUseSubscription<Meeting>(MEETING_SUBSCRIPTION, {}, true);
  const {
    data: meetingData,
  } = meetingSubscription();

  useEffect(() => {
    if (meetingData) {
      const meeting = JSON.parse(JSON.stringify(meetingData[0]));
      const { meetingId } = meeting;
      Meetings.upsert({ meetingId }, meeting);
    }
  }, [meetingData]);
  return null;
};

export default MeetingGrapQlMiniMongoAdapter;
