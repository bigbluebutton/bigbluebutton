import { check } from 'meteor/check';
import clearReactions from '../modifiers/clearReactions';

export default function handleClearUsersReaction({ body }, meetingId) {
  check(meetingId, String);
  clearReactions(meetingId);
}
