import { check } from 'meteor/check';
import setGuestLobbyMessage from '../modifiers/setGuestLobbyMessage';

export default function handleGuestLobbyMessageChanged({ body }, meetingId) {
  const { message } = body;

  check(meetingId, String);
  check(message, String);

  return setGuestLobbyMessage(meetingId, message);
}
