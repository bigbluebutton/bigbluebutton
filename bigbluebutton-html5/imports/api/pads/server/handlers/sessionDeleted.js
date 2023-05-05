import deleteSession from '/imports/api/pads/server/modifiers/deleteSession';

export default function sessionDeleted({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    userId,
    sessionId,
  } = body;

  deleteSession(meetingId, externalId, userId, sessionId);
}
