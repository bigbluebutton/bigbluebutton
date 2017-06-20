import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';
import Users from './../../';

import addUser from '../modifiers/addUser';
import removeUser from '../modifiers/removeUser';

export default function handleGetUsers({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const users = payload.users;

  check(meetingId, String);
  check(users, Array);

  const usersIds = users.map(m => m.userid);

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
