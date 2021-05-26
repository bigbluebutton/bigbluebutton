import { check } from 'meteor/check';
import startExternalVideo from '../modifiers/startExternalVideo';

export default function handleStartExternalVideo({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  check(meetingId, String);

  const { externalVideoUrl } = body;
  startExternalVideo(meetingId, userId, externalVideoUrl);
}
