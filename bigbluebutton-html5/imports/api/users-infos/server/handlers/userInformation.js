import { check } from 'meteor/check';
import addUserInfo from '../modifiers/addUserInfo';

export default async function handleUserInformation({ header, body }) {
  check(body, Object);
  check(header, Object);

  const { userInfo } = body;
  const { userId, meetingId } = header;

  check(userInfo, Array);
  check(userId, String);
  check(meetingId, String);

  const result = await addUserInfo(userInfo, userId, meetingId);
  return result;
}
