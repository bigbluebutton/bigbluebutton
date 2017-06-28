import { check } from 'meteor/check';
import addUser from '../modifiers/addUser';

export default function handleUserJoined({ header, body }) {
  const { meetingId } = header;
  const user = body;

  check(meetingId, String);
  check(user, Object);

  return addUser(meetingId, user);
}
