import kickUser from '../modifiers/kickUser';

export default function handleKickUser({ header }) {
  const { meetingId, userId } = header;

  return kickUser(meetingId, userId);
}
