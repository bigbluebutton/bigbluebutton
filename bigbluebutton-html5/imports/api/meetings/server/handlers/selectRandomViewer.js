import { check } from 'meteor/check';
import updateRandomViewer from '../modifiers/updateRandomViewer';

export default function randomlySelectedUser({ header, body }) {
  const { selectedUserId, requestedBy } = body;
  const { meetingId } = header;

  check(meetingId, String);
  check(requestedBy, String);
  check(selectedUserId, String);

  updateRandomViewer(meetingId, selectedUserId, requestedBy);
}
