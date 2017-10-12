import { check } from 'meteor/check';
import addPresentation from '../modifiers/addPresentation';

export default function handlePresentationAdded({ body }, meetingId) {
  check(body, Object);

  const { presentation } = body;

  check(meetingId, String);
  check(presentation, Object);

  return addPresentation(meetingId, presentation);
}
