import changeLayout from '../modifiers/changeLayout';

export default function broadcastLayout({ body }, meetingId) {
  const { layout, presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate, setByUserId } = body;

  changeLayout(meetingId, layout, presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate, setByUserId);
}
