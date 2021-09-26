import changeLayout from '../modifiers/changeLayout';

export default function broadcastLayout({ body }, meetingId) {
  const { layout, setByUserId, applyTo } = body;

  changeLayout(meetingId, layout, setByUserId, applyTo);
}
