import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
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
  }).fetch().length > 0;

  if (!hasUsers) {
    Meteor.call('requestGuestUsers', meetingId, user.intId);
  }
  return addUser(meetingId, user);
}
