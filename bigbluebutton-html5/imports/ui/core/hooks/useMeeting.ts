import useCreateUseSubscription from './createUseSubscription';
import MEETING_SUBSCRIPTION from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';

const useMeetingSubscription = useCreateUseSubscription<Meeting>(MEETING_SUBSCRIPTION, {}, true);

export const useMeeting = (fn: (c: Partial<Meeting>) => Partial<Meeting>) => {
  const response = useMeetingSubscription(fn);
  return {
    ...response,
    data: response.data?.[0],
  };
};

export default useMeeting;
