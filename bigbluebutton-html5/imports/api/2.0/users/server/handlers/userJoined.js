import { check } from 'meteor/check';
import addUser from '../modifiers/addUser';

export default function handleUserJoined(meetingId, { body }) {
  const user = body;

  check(user, Object);

  return addUser(meetingId, user);
}
