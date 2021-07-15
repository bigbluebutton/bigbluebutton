import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import addUserReaction from '/imports/api/user-reaction/server/modifiers/addUserReaction';

export default function setUserReaction(reaction) {
  check(reaction, String);
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  addUserReaction(meetingId, requesterUserId, reaction);
}
