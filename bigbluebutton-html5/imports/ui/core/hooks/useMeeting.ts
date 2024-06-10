import { useMemo } from 'react';
import useCreateUseSubscription from './createUseSubscription';
import MEETING_SUBSCRIPTION from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';

const useMeetingSubscription = useCreateUseSubscription<Meeting>(MEETING_SUBSCRIPTION, {}, true);

export const useMeeting = (fn: (c: Partial<Meeting>) => Partial<Meeting>) => {
  const response = useMeetingSubscription(fn);

  const returnObject = useMemo(() => ({
    ...response,
    data: response.data?.[0],
  }), [response]);
  return returnObject;
};

export default useMeeting;
