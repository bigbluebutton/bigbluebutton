import deleteSession from '/imports/api/pads/server/modifiers/deleteSession';

export default async function sessionDeleted({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    userId,
    sessionId,
  } = body;

  await deleteSession(meetingId, externalId, userId, sessionId);
}
