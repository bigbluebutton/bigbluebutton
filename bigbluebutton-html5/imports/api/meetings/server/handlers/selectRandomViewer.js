import { check } from 'meteor/check';
import updateRandomViewer from '../modifiers/updateRandomViewer';

export default function randomlySelectedUser({ header, body }) {
  const { requestedBy, choice } = body;
  const { meetingId } = header;

  check(meetingId, String);
  check(requestedBy, String);
  check(choice, String);

  updateRandomViewer(meetingId, choice, requestedBy);
}
