import { check } from 'meteor/check';

import removePresentation from '../modifiers/removePresentation';

export default function handlePresentationRemove({ body }, meetingId) {
  const { podId, presentationId } = body;

  check(meetingId, String);
  check(podId, String);
  check(presentationId, String);

  return removePresentation(meetingId, podId, presentationId);
}
