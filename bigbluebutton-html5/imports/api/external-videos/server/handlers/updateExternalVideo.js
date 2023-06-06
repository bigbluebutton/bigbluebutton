import { check } from 'meteor/check';
import updateExternalVideo from '../modifiers/updateExternalVideo';

export default async function handleUpdateExternalVideo({ header, body }, meetingId) {
  check(header, Object);
  check(body, Object);
  check(meetingId, String);

  const { userId } = header;

  const {
    status,
    rate,
    time,
    state,
  } = body;

  await updateExternalVideo(meetingId, userId, status, rate, time, state);
}
