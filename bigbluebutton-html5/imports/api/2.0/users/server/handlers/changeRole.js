import changeRole from '../modifiers/changeRole';

export default function handleChangeRole({ body }, meetingId) {
  changeRole({ body }, meetingId);
}
