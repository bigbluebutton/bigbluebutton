import { check } from 'meteor/check';
import setGuestStatus from '../modifiers/setGuestStatus';

export default async function handleGuestApproved({ body }, meetingId) {
  const { approvedBy, guests } = body;
  check(meetingId, String);
  check(approvedBy, String);
  check(guests, Array);

  const result = await Promise.all(guests.map(async (guest) => {
    const a = await setGuestStatus(meetingId, guest.guest, guest.status, approvedBy);
    return a;
  }));
  return result;
}
