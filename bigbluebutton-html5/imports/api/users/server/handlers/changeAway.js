import { check } from 'meteor/check';
import changeAway from '/imports/api/users/server/modifiers/changeAway';

export default async function handleAway(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  const { userId: requesterUserId, away } = payload.body;

  await changeAway(meetingId, requesterUserId, away);
}
