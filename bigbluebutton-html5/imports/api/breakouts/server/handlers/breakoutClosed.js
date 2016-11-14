import clearBreakouts from '../modifiers/clearBreakouts';

export default function breakoutClosed({ payload }) {
  return clearBreakouts(payload.meetingId);
}
