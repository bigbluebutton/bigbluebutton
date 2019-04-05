import userEjected from '../modifiers/userEjected';

export default function handleEjectedUser({ header, body }) {
  const { meetingId, userId } = header;
  const { reasonCode } = body;

  return userEjected(meetingId, userId, reasonCode);
}
