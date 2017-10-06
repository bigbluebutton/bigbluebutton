import { check } from 'meteor/check';
import changeRole from '../modifiers/changeRole';

export default function handleChangeRole({ body }, meetingId) {
  check(body, Object);
  check(meetingId, String);

  changeRole({ body }, meetingId);
}
