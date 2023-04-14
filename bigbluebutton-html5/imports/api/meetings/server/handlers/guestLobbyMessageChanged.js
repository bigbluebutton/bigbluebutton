import { check } from 'meteor/check';
import setGuestLobbyMessage from '../modifiers/setGuestLobbyMessage';

export default async function handleGuestLobbyMessageChanged({ body }, meetingId) {
  const { message } = body;

  check(meetingId, String);
  check(message, String);
  const result = await setGuestLobbyMessage(meetingId, message);
  return result;
}
