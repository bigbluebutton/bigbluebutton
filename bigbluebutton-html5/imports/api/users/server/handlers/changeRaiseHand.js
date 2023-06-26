import { check } from 'meteor/check';
import changeRaiseHand from '/imports/api/users/server/modifiers/changeRaiseHand';

export default async function handleChangeRaiseHand(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId: requesterUserId, raiseHand } = payload.body;

  await changeRaiseHand(meetingId, requesterUserId, raiseHand);
}
