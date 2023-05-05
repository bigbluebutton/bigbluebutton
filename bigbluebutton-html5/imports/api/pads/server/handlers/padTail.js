import tailPad from '/imports/api/pads/server/modifiers/tailPad';

export default function padTail({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    tail,
  } = body;

  tailPad(meetingId, externalId, tail);
}
