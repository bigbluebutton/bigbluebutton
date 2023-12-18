import createGroup from '/imports/api/pads/server/modifiers/createGroup';

export default async function groupCreated({ header, body }) {
  const {
    meetingId,
    userId,
  } = header;

  const {
    externalId,
    model,
    name,
  } = body;

  await createGroup(meetingId, userId, externalId, model, name);
}
