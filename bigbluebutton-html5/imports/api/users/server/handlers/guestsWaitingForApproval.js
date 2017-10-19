import { check } from 'meteor/check';

import setApprovedStatus from '../modifiers/setApprovedStatus';

export default function handleGuestsWaitingForApproval({ body }, meetingId) {
  const { guests } = body;

  check(guests, Array);

  return guests.map(guest => setApprovedStatus(meetingId, guest.intId, false));
}
