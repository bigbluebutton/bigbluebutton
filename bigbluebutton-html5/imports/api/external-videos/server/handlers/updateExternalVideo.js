import { check } from 'meteor/check';
import updateExternalVideo from '../modifiers/updateExternalVideo';

export default function handleUpdateExternalVideo({ header, body }, meetingId) {
  const { userId } = header;
  check(body, Object);
  check(meetingId, String);
  check(userId, String);
  const {
    status,
    rate,
    time,
    state,
  } = body;

  updateExternalVideo(meetingId, userId, status, rate, time, state);
}
