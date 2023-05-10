import { check } from 'meteor/check';
import stopExternalVideo from '../modifiers/stopExternalVideo';

export default async function handleStopExternalVideo({ header }, meetingId) {
  check(header, Object);
  check(meetingId, String);

  const { userId } = header;

  await stopExternalVideo(userId, meetingId);
}
