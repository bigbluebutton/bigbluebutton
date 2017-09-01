import unsharedWebcam from '../modifiers/unsharedWebcam';

export default function handleUserUnsharedHtml5Webcam({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;

  check(meetingId, String);

  return unsharedWebcam(meetingId, userId);
}
