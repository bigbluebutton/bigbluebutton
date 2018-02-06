import changeWebcamOnlyModerator from '../modifiers/webcamOnlyModerator';

export default function handleChangeWebcamOnlyModerator({ body }, meetingId) {
  return changeWebcamOnlyModerator(meetingId, body);
}
