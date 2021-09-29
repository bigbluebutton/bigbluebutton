import { check } from 'meteor/check';
import startExternalVideo from '../modifiers/startExternalVideo';

export default function handleStartExternalVideo({ header, body }, meetingId) {
  check(header, Object);
  check(body, Object);
  check(meetingId, String);

  const { userId } = header;
  const { externalVideoUrl } = body;

  startExternalVideo(meetingId, userId, externalVideoUrl);
}
