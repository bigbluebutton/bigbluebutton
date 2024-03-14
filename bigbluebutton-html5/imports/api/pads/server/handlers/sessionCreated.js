import createSession from '/imports/api/pads/server/modifiers/createSession';

export default async function sessionCreated({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const {
    externalId,
    sessionId,
  } = body;

  await createSession(meetingId, userId, externalId, sessionId);
}
