import sharedWebcam from '../modifiers/sharedWebcam';

export default function handleUserSharedHtml5Webcam({ header, payload }) {
  const meetingId = header.meetingId;
  const userId = header.userId;

  check(meetingId, String);

  return sharedWebcam(meetingId, userId);
}
