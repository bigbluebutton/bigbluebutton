import { check } from 'meteor/check';
import setCurrentPresentation from '../modifiers/setCurrentPresentation';

export default async function handlePresentationCurrentSet({ body }, meetingId) {
  check(body, Object);

  const { presentationId, podId } = body;

  check(meetingId, String);
  check(presentationId, String);
  check(podId, String);

  const result = await setCurrentPresentation(meetingId, podId, presentationId);
  return result;
}
