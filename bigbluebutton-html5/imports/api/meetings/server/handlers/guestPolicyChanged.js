import { check } from 'meteor/check';
import setGuestPolicy from '../modifiers/setGuestPolicy';

export default function handleGuestPolicyChanged({ body }, meetingId) {
  const { policy } = body;

  check(meetingId, String);
  check(policy, String);


  return setGuestPolicy(meetingId, policy);
}
