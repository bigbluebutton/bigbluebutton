import { check } from 'meteor/check';
import clearBreakouts from '../modifiers/clearBreakouts';

export default function handleBreakoutClosed({ body }) {
  const { breakoutId } = body;
  console.log('passei', body);
  check(breakoutId, String);

  return clearBreakouts(breakoutId);
}
