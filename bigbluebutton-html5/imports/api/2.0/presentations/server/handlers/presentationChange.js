import addPresentation from '../modifiers/addPresentation';

export default function handlePresentationChange({ header, body }) {
  const { meetingId } = header;
  const { presentation } = body;

  check(meetingId, String);
  check(presentation, Object);

  return addPresentation(meetingId, presentation);
}
