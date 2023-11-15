import createUseSubscription from './createUseSubscription';
import MEETING_SUBSCRIPTION from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';

const useMeetingSubscription = createUseSubscription<Meeting>(MEETING_SUBSCRIPTION);

export const useMeeting = (fn: (c: Partial<Meeting>) => Partial<Meeting>) => {
  const response = useMeetingSubscription(fn);
  const returnObject = {
    ...response,
    data: response.data?.[0],
  };
  return returnObject;
};

export default useMeeting;
