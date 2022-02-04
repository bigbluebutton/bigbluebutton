import changeLayout from '../modifiers/changeLayout';

export default function broadcastLayout({ body }, meetingId) {
  const { layout, presentationIsOpen, cameraPosition, focusedCamera, presentationVideoRate, setByUserId } = body;

  changeLayout(meetingId, layout, presentationIsOpen, cameraPosition, focusedCamera, presentationVideoRate, setByUserId);
}
