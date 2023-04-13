import createPad from '/imports/api/pads/server/modifiers/createPad';

export default async function padCreated({ header, body }) {
  const { meetingId } = header;
  const {
    externalId,
    padId,
  } = body;

  await createPad(meetingId, externalId, padId);
}
