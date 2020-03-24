import { check } from 'meteor/check';

export default function authenticateWhiteboardConnection(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  this.setUserId(`${meetingId}--${requesterUserId}`);

  return true;
}
