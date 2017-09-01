import sharedWebcam from '../modifiers/sharedWebcam';

export default function handleUserSharedHtml5Webcam({ payload, header }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid;

  check(meetingId, String);

  return sharedWebcam(meetingId, userId);
}
