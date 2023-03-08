import { check } from 'meteor/check';
import setMobile from '/imports/api/users/server/modifiers/setMobile';

export default function handleChangeMobileFlag(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId, mobile } = payload.body;

  if(mobile) {
    setMobile(meetingId, userId);
  }
}
