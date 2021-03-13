import setGuestPolicy from '../modifiers/setGuestPolicy';
import { check } from 'meteor/check';

export default function handleGuestPolicyChanged({ body }, meetingId) {
  const { policy } = body;

  check(meetingId, String);
  check(policy, String);


  return setGuestPolicy(meetingId, policy);
}
