import { check } from 'meteor/check';
import userInactivityInspect from '../modifiers/userInactivityInspect';

export default function handleUserInactivityInspect({ header, body }, meetingId) {
  const { userId } = header;
  const { responseDelay } = body;

  check(userId, String);
  check(responseDelay, Match.Integer);
  check(meetingId, String);


  return userInactivityInspect(userId, responseDelay);
}
