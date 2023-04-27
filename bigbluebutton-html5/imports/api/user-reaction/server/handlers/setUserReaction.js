import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import UsersReaction from '/imports/api/users';
import addUserReaction from '../modifiers/addUserReaction';
import addUserEmoji from '../modifiers/addUserEmoji';

export default function handleSetUserReaction({ body }, meetingId) {
  const { userId, emoji } = body;

  if (emoji == 'none' || emoji == 'raiseHand' || emoji == 'away' || emoji == 'notAway') {
    addUserEmoji(meetingId, userId, emoji);
  } else {
    addUserReaction(meetingId, userId, emoji);
  }
}
