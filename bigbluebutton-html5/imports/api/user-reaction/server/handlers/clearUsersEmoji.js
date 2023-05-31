import { check } from 'meteor/check';
import clearUsersEmoji from '../modifiers/clearUsersEmoji';

export default function handleClearUsersEmoji({ body }, meetingId) {
  check(meetingId, String);
  clearUsersEmoji(meetingId);
}
