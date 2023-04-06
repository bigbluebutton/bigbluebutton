import pinPad from '/imports/api/pads/server/modifiers/pinPad';

export default async function padPinned({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    pinned,
  } = body;

  await pinPad(meetingId, externalId, pinned);
}
