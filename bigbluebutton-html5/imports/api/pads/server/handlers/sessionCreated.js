import createSession from '/imports/api/pads/server/modifiers/createSession';

export default function sessionCreated({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const {
    externalId,
    sessionId,
  } = body;

  createSession(meetingId, userId, externalId, sessionId);
}
