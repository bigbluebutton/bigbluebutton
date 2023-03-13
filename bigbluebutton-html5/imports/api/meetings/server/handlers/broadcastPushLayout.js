import setPushLayout from '../modifiers/setPushLayout';

export default async function broadcastPushLayout({ body }, meetingId) {
  const { pushLayout, setByUserId } = body;

  const result = await setPushLayout(meetingId, pushLayout, setByUserId);
  return result;
}
