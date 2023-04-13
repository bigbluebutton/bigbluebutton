import { check } from 'meteor/check';
import clearBreakouts from '../modifiers/clearBreakouts';

export default async function handleBreakoutClosed({ body }) {
  const { breakoutId } = body;
  check(breakoutId, String);
  const result = await clearBreakouts(breakoutId);
  return result;
}
