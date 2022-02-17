import createGroup from '/imports/api/pads/server/modifiers/createGroup';

export default function groupCreated({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const {
    externalId,
    model,
    name,
  } = body;

  createGroup(meetingId, userId, externalId, model, name);
}
