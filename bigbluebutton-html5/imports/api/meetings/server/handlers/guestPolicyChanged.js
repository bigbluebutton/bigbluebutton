import { check } from 'meteor/check';
import setGuestPolicy from '../modifiers/setGuestPolicy';

export default async function handleGuestPolicyChanged({ body }, meetingId) {
  const { policy } = body;

  check(meetingId, String);
  check(policy, String);

  const result = await setGuestPolicy(meetingId, policy);
  return result;
}
