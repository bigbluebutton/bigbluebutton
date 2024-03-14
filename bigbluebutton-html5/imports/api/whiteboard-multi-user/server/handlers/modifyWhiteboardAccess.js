import { check } from 'meteor/check';
import modifyWhiteboardAccess from '../modifiers/modifyWhiteboardAccess';

export default async function handleModifyWhiteboardAccess({ body }, meetingId) {
  const { multiUser, whiteboardId } = body;

  check(multiUser, Array);
  check(whiteboardId, String);
  check(meetingId, String);
  const result = await modifyWhiteboardAccess(meetingId, whiteboardId, multiUser);
  return result;
}
