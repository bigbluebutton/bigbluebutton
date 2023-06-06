import { check } from 'meteor/check';
import startExternalVideo from '../modifiers/startExternalVideo';

export default async function handleStartExternalVideo({ header, body }, meetingId) {
  check(header, Object);
  check(body, Object);
  check(meetingId, String);

  const { userId } = header;
  const { externalVideoUrl } = body;

  await startExternalVideo(meetingId, userId, externalVideoUrl);
}
