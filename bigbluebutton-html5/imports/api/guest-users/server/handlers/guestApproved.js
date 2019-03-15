import { check } from 'meteor/check';
import setGuestStatus from '../modifiers/setGuestStatus';

export default function handleGuestsWaitingForApproval({ header, body }, meetingId) {
  const { userId } = header;
  const { approvedBy, guests } = body;

  check(userId, String);
  check(meetingId, String);
  check(approvedBy, String);

  return guests.forEach(guest => setGuestStatus(meetingId, guest.guest, guest.status, approvedBy));
}
