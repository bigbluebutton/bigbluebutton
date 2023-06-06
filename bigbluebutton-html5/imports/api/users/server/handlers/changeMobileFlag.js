import { check } from 'meteor/check';
import setMobile from '/imports/api/users/server/modifiers/setMobile';

export default async function handleChangeMobileFlag(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId: requesterUserId, mobile } = payload.body;

  if (mobile) {
    await setMobile(meetingId, requesterUserId);
  }
}
