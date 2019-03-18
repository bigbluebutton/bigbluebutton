import { check } from 'meteor/check';
import requestGuestUsers from '/imports/api/guest-users/server/methods/requestGuestUsers';
import Users from '/imports/api/users';
import addUser from '../modifiers/addUser';

export default function handleUserJoined({ body }, meetingId) {
  const user = body;
  check(user, Object);
  const hasUsers = Users.find({
    clientType: 'HTML5',
    connectionStatus: 'online',
    guest: false,
    meetingId,
  }).count();

  if (!hasUsers) {
    requestGuestUsers(meetingId, user.intId);
  }
  return addUser(meetingId, user);
}
