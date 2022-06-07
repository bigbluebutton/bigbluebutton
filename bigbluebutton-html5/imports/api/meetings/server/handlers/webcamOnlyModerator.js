import changeWebcamOnlyModerator from '../modifiers/webcamOnlyModerator';

export default function handleChangeWebcamOnlyModerator({ body }, meetingId) {
  changeWebcamOnlyModerator(meetingId, body);
}
