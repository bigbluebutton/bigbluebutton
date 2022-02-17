import { check } from 'meteor/check';
import updateExternalVideo from '../modifiers/updateExternalVideo';

export default function handleUpdateExternalVideo({ header, body }, meetingId) {
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

  updateExternalVideo(meetingId, userId, status, rate, time, state);
}
