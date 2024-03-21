import { useSubscription } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import CURRENT_USER_SUBSCRIPTION from '/imports/ui/core/graphql/queries/currentUserSubscription';
import { User } from '/imports/ui/Types/user';
import Users from '/imports/api/users';
import logger from '/imports/startup/client/logger';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import MEETING_SUBSCRIPTION from '/imports/ui/core/graphql/queries/meetingSubscription';
import { Meeting } from '/imports/ui/Types/meeting';
import Meetings from '/imports/api/meetings';

const MeetingGrapQlMiniMongoAdapter: React.FC = () => {
  const meetingSubscription = useCreateUseSubscription<Meeting>(MEETING_SUBSCRIPTION, {}, true);
  const {
    data: meetingData,
    loading: meetingLoading,
  } = meetingSubscription();
  // useEffect(() => {
  //   if (error) {
  //     logger.error('Error in UserGrapQlMiniMongoAdapter', error);
  //   }
  // }, [error]);

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
