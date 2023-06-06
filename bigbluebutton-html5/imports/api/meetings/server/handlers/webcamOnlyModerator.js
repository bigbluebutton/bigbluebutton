import changeWebcamOnlyModerator from '../modifiers/webcamOnlyModerator';

export default async function handleChangeWebcamOnlyModerator({ body }, meetingId) {
  await changeWebcamOnlyModerator(meetingId, body);
}
