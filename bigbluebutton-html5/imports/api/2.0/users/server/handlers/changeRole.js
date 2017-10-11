import { check } from 'meteor/check';
import changeRole from '../modifiers/changeRole';

export default function handleChangeRole(payload, meetingId) {
  check(payload.body, Object);
  check(meetingId, String);

  changeRole(payload, meetingId);
}
