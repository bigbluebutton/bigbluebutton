import tailPad from '/imports/api/pads/server/modifiers/tailPad';

export default async function padTail({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    tail,
  } = body;

  await tailPad(meetingId, externalId, tail);
}
