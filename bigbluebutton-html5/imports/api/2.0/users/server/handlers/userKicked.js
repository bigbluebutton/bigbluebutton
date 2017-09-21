import userKicked from '../modifiers/userKicked';

export default function handleKickUser({ header }) {
  const { meetingId, userId } = header;

  return userKicked(meetingId, userId);
}
