import { check } from 'meteor/check';
import updateRandomViewer from '../modifiers/updateRandomViewer';

export default function randomlySelectedUser({ header, body }) {
  const { userIds, choice, requestedBy } = body;
  const { meetingId } = header;

  check(meetingId, String);
  check(requestedBy, String);
  check(userIds, Array);
  check(choice, String);

  updateRandomViewer(meetingId, userIds, choice, requestedBy);
}
