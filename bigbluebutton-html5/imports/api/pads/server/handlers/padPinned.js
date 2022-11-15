import pinPad from '/imports/api/pads/server/modifiers/pinPad';

export default function padPinned({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    pinned,
  } = body;

  pinPad(meetingId, externalId, pinned);
}
