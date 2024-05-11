import React, { useEffect, useRef } from 'react';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import MEETING_SUBSCRIPTION from '/imports/ui/core/graphql/queries/meetingSubscription';
import { Meeting } from '/imports/ui/Types/meeting';
import Meetings from '/imports/api/meetings';
import { AdapterProps } from '../graphqlToMiniMongoAdapterManager/component';

const MeetingGrapQlMiniMongoAdapter: React.FC<AdapterProps> = ({
  onReady,
  children,
}) => {
  const ready = useRef(false);
  const meetingSubscription = useCreateUseSubscription<Meeting>(MEETING_SUBSCRIPTION, {}, true);
  const {
    data: meetingData,
  } = meetingSubscription();

  useEffect(() => {
    if (meetingData) {
      if (!ready.current) {
        ready.current = true;
        onReady('MeetingGrapQlMiniMongoAdapter');
      }
      const meeting = JSON.parse(JSON.stringify(meetingData[0]));
      const { meetingId } = meeting;
      Meetings.upsert({ meetingId }, meeting);
    }
  }, [meetingData]);
  return children;
};

export default MeetingGrapQlMiniMongoAdapter;
