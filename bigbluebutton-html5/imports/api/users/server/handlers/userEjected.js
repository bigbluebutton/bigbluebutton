import userEjected from '../modifiers/userEjected';

export default function handleEjectedUser({ header }) {
  const { meetingId, userId } = header;

  return userEjected(meetingId, userId);
}
