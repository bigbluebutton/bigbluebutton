import modifyWBMode from '../modifiers/modifyWBMode';
import { check } from 'meteor/check';

export default function handleModifyWBMode({ body }, meetingId) {
  //const whiteboardId = body.whiteboardId;
  const whiteboardMode = body.whiteboardMode;

  check(meetingId, String);
  //check(whiteboardId, String);
  check(whiteboardMode, Object);

  return modifyWBMode(meetingId, whiteboardMode);
}
