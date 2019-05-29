import { check } from 'meteor/check';
import setGuestStatus from '../modifiers/setGuestStatus';

export default function handleGuestApproved({ body }, meetingId) {
  const { approvedBy, guests } = body;
  check(meetingId, String);
  check(approvedBy, String);
  check(guests, Array);

  return guests.forEach(guest => setGuestStatus(meetingId, guest.guest, guest.status, approvedBy));
}
