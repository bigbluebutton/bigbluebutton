import { check } from 'meteor/check';
import changeUserName from '/imports/api/users/server/modifiers/changeUserName';

export default function handleChangeUserName(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId, newUserName } = payload.body;

  changeUserName(newUserName, userId, meetingId);
}
