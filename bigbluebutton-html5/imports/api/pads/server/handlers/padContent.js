import contentPad from '/imports/api/pads/server/modifiers/contentPad';

export default async function padContent({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    start,
    end,
    text,
  } = body;

  await contentPad(meetingId, externalId, start, end, text);
}
