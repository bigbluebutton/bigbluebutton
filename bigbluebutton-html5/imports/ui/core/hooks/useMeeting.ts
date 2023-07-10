import { createUseSubsciption } from './createUseSubscription';
import { MEETING_SUBSCRIPTION } from '../graphql/queries/meetingSubscription';
import { Meeting } from '../../Types/meeting';

const useMeetingSubscription = createUseSubsciption<Partial<Meeting>>(MEETING_SUBSCRIPTION, false);

export const useMeeting = (fn: (c: Partial<Meeting>) => Partial<Meeting>): Partial<Meeting> => {
  const meeting = useMeetingSubscription(fn)[0];
  return meeting;
};
