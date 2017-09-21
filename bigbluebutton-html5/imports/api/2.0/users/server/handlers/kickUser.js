import kickUser from '../modifiers/kickUser';

export default function handleKickUser({ header }) {
  const meetingId = header.meetingId;
  const userId = header.userId;

  return kickUser(meetingId, userId);
}
