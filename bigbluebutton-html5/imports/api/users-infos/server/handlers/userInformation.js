import { check } from 'meteor/check';
import addUserInfo from '../modifiers/addUserInfo';

export default function handleUserInformation({ header, body }, meetingId) {
  check(body, Object);

  return addUserInfo(body.userInfo, header.userId, header.meetingId);
}
