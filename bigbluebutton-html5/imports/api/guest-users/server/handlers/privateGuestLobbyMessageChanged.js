import { check } from 'meteor/check';
import setPrivateGuestLobbyMessage from '../modifiers/setPrivateGuestLobbyMessage';

export default function handlePrivateGuestLobbyMessageChanged({ body }, meetingId) {
  const {guestId, message } = body;

  check(meetingId, String);
  check(guestId, String)
  check(message, String);

  setPrivateGuestLobbyMessage(meetingId, guestId, message);
}

