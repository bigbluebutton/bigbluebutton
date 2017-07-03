import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/2.0/users/';
import addUser from '../modifiers/addUser';
import removeUser from '../modifiers/removeUser';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

export default function handleGetUsers({ envelope, body }, meetingId) {
  if (!inReplyToHTML5Client(envelope)) {
    return;
  }
  const { users } = body;

  check(meetingId, String);
  check(users, Array);

  const usersIds = users.map(m => m.intId);

  const usersToRemove = Users.find({
    meetingId,
    userId: { $nin: usersIds },
  }).fetch();

  usersToRemove.forEach(user => removeUser(meetingId, user.userId));

  const usersAdded = [];
  users.forEach((user) => {
    usersAdded.push(addUser(meetingId, user));
  });

  return usersAdded;
}
