import setGuestLobbyMessage from '../modifiers/setGuestLobbyMessage';
import { check } from 'meteor/check';

export default function handleGuestLobbyMessageChanged({ body }, meetingId) {
  const { message } = body;

  check(meetingId, String);
  check(message, String);

  return setGuestLobbyMessage(meetingId, message);
}
