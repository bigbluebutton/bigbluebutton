import { check } from 'meteor/check';
import clearBreakouts from '../modifiers/clearBreakouts';

export default function handleBreakoutClosed({ body }) {
  const { breakoutId } = body;
  check(breakoutId, String);

  return clearBreakouts(breakoutId);
}
