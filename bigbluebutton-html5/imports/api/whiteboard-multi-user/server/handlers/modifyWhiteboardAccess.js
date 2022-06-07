import { check } from 'meteor/check';
import modifyWhiteboardAccess from '../modifiers/modifyWhiteboardAccess';

export default function handleModifyWhiteboardAccess({ body }, meetingId) {
  const { multiUser, whiteboardId } = body;

  check(multiUser, Array);
  check(whiteboardId, String);
  check(meetingId, String);

  return modifyWhiteboardAccess(meetingId, whiteboardId, multiUser);
}
