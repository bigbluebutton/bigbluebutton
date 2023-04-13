import { check } from 'meteor/check';

import removePresentation from '../modifiers/removePresentation';

export default async function handlePresentationRemove({ body }, meetingId) {
  const { podId, presentationId } = body;

  check(meetingId, String);
  check(podId, String);
  check(presentationId, String);

  const result = await removePresentation(meetingId, podId, presentationId);
  return result;
}
