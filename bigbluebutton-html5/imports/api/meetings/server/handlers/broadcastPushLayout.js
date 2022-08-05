import setPushLayout from '../modifiers/setPushLayout';

export default function broadcastPushLayout({ body }, meetingId) {
  const { pushLayout, setByUserId } = body;

  setPushLayout(meetingId, pushLayout, setByUserId);
}
