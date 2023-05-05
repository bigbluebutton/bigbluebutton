import contentPad from '/imports/api/pads/server/modifiers/contentPad';

export default function padContent({ header, body }) {
  const {
    meetingId,
  } = header;

  const {
    externalId,
    start,
    end,
    text,
  } = body;

  contentPad(meetingId, externalId, start, end, text);
}
