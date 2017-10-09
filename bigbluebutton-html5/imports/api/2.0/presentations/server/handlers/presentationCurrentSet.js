import { check } from 'meteor/check';
import setCurrentPresentation from '../modifiers/setCurrentPresentation';

export default function handlePresentationCurrentSet({ body }, meetingId) {
  check(body, Object);

  const { presentationId } = body;

  check(meetingId, String);
  check(presentationId, String);

  return setCurrentPresentation(meetingId, presentationId);
}
