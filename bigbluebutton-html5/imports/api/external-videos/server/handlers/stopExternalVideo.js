import { check } from 'meteor/check';
import stopExternalVideo from '../modifiers/stopExternalVideo';

export default function handleStopExternalVideo({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  check(meetingId, String);
  check(userId, String);

  stopExternalVideo(userId, meetingId);
}
