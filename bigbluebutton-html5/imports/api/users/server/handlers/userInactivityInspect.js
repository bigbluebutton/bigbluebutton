import { check } from 'meteor/check';
import userInactivityInspect from '../modifiers/userInactivityInspect';

export default async function handleUserInactivityInspect({ header, body }, meetingId) {
  const { userId } = header;
  const { responseDelay } = body;

  check(userId, String);
  check(responseDelay, Match.Integer);
  check(meetingId, String);

  await userInactivityInspect(userId, responseDelay);
}
