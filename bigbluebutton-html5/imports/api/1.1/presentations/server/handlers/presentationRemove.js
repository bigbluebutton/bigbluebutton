import { check } from 'meteor/check';

import removePresentation from '../modifiers/removePresentation';

export default function handlePresentationRemove({ body }, meetingId) {
  const { presentationId } = body;

  check(meetingId, String);
  check(presentationId, String);

  return removePresentation(meetingId, presentationId);
}
