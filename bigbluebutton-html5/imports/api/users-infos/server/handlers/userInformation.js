import { check } from 'meteor/check';
import addUserInfo from '../modifiers/addUserInfo';

export default function handleUserInformation({ header, body }) {
  check(body, Object);
  check(header, Object);

  const { userInfo } = body;
  const { userId, meetingId } = header;

  check(userInfo, Array);
  check(userId, String);
  check(meetingId, String);

  return addUserInfo(userInfo, userId, meetingId);
}
