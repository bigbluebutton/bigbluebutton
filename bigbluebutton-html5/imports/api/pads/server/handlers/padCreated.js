import createPad from '/imports/api/pads/server/modifiers/createPad';

export default function padCreated({ header, body }) {
  const { meetingId } = header;
  const {
    externalId,
    padId,
  } = body;

  createPad(meetingId, externalId, padId);
}
