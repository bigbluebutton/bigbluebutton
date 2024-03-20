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
  console.log('meetingData', meetingData);
  // useEffect(() => {
  //   if (error) {
  //     logger.error('Error in UserGrapQlMiniMongoAdapter', error);
  //   }
  // }, [error]);

  useEffect(() => {
    if (meetingData) {
      const { meetingId } = meetingData[0];
      console.log("🚀 -> useEffect -> meetingId:", meetingId);
      Meetings.upsert({ meetingId }, meetingData[0]);
    }
    console.log('meetingData', Meetings.find().fetch());
  }, [meetingData]);
  return null;
};

export default MeetingGrapQlMiniMongoAdapter;
