import { check } from 'meteor/check';
import setPrivateGuestLobbyMessage from '../modifiers/setPrivateGuestLobbyMessage';

export default async function handlePrivateGuestLobbyMessageChanged({ body }, meetingId) {
  const { guestId, message } = body;

  check(meetingId, String);
  check(guestId, String);
  check(message, String);

  const result = await setPrivateGuestLobbyMessage(meetingId, guestId, message);
  return result;
}
